import assert from 'node:assert/strict';
import test from 'node:test';

import type { SkillNode, SkillEdge, SkillEdgeType } from '../types/index.ts';

// ─── Inline graph primitives (same logic as skillGraph.ts/graphTraversal.ts)
// We inline these to avoid the protocol import chain that requires bundler aliases.

interface SkillGraph {
  nodes: Map<string, SkillNode>;
  edges: SkillEdge[];
}

function buildSkillGraph(nodes: SkillNode[], edges: SkillEdge[]): SkillGraph {
  const nodeMap = new Map<string, SkillNode>();
  for (const node of nodes) nodeMap.set(node.id, node);
  return { nodes: nodeMap, edges };
}

function getSkillNode(graph: SkillGraph, skillId: string): SkillNode | null {
  return graph.nodes.get(skillId) ?? null;
}

function getEdgesFrom(graph: SkillGraph, skillId: string, edgeType?: SkillEdgeType): SkillEdge[] {
  return graph.edges.filter(
    (e) => e.fromSkillId === skillId && (edgeType === undefined || e.edgeType === edgeType)
  );
}

function getEdgesTo(graph: SkillGraph, skillId: string, edgeType?: SkillEdgeType): SkillEdge[] {
  return graph.edges.filter(
    (e) => e.toSkillId === skillId && (edgeType === undefined || e.edgeType === edgeType)
  );
}

function resolveTargetNodes(graph: SkillGraph, edges: SkillEdge[], direction: 'to' | 'from'): SkillNode[] {
  const results: SkillNode[] = [];
  for (const edge of edges) {
    const targetId = direction === 'to' ? edge.toSkillId : edge.fromSkillId;
    const node = getSkillNode(graph, targetId);
    if (node && node.isActive) results.push(node);
  }
  return results;
}

function getPrerequisiteSkills(graph: SkillGraph, skillId: string): SkillNode[] {
  return resolveTargetNodes(graph, getEdgesTo(graph, skillId, 'prerequisite'), 'from');
}

function getAdvanceOptions(graph: SkillGraph, skillId: string): SkillNode[] {
  return resolveTargetNodes(graph, getEdgesFrom(graph, skillId, 'advance'), 'to');
}

function getRegressionOptions(graph: SkillGraph, skillId: string): SkillNode[] {
  return resolveTargetNodes(graph, getEdgesFrom(graph, skillId, 'regress'), 'to');
}

function getDetourOptions(graph: SkillGraph, skillId: string): SkillNode[] {
  return resolveTargetNodes(graph, getEdgesFrom(graph, skillId, 'detour'), 'to');
}

function getProofingOptions(graph: SkillGraph, skillId: string): SkillNode[] {
  return resolveTargetNodes(graph, getEdgesFrom(graph, skillId, 'proofing'), 'to');
}

function getNextRecommendedSkills(graph: SkillGraph, skillId: string): SkillNode[] {
  return [...getAdvanceOptions(graph, skillId), ...getProofingOptions(graph, skillId)];
}

function getSkillPath(graph: SkillGraph, behavior: string): SkillNode[] {
  const nodes = [...graph.nodes.values()].filter(
    (n) => n.behavior === behavior && n.isActive && n.kind !== 'recovery' && n.kind !== 'diagnostic'
  );
  return nodes.sort((a, b) => a.stage - b.stage || a.difficulty - b.difficulty);
}

// Graph validation (inlined from graphValidation.ts)
interface ValidationIssue {
  type: 'missing_protocol' | 'orphan_node' | 'prerequisite_cycle' | 'invalid_edge';
  nodeId?: string;
  edgeId?: string;
  message: string;
}

function detectOrphanNodes(graph: SkillGraph, behavior: string): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const behaviorNodes = [...graph.nodes.values()].filter((n) => n.behavior === behavior);
  const connectedIds = new Set<string>();
  for (const edge of graph.edges) {
    connectedIds.add(edge.fromSkillId);
    connectedIds.add(edge.toSkillId);
  }
  for (const node of behaviorNodes) {
    if (!connectedIds.has(node.id)) {
      issues.push({ type: 'orphan_node', nodeId: node.id, message: `Orphan: ${node.id}` });
    }
  }
  return issues;
}

function detectPrerequisiteCycles(graph: SkillGraph, behavior: string): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const behaviorNodeIds = new Set(
    [...graph.nodes.values()].filter((n) => n.behavior === behavior).map((n) => n.id)
  );
  const prereqEdges = graph.edges.filter(
    (e) => e.edgeType === 'prerequisite' && (behaviorNodeIds.has(e.fromSkillId) || behaviorNodeIds.has(e.toSkillId))
  );
  const adjacency = new Map<string, string[]>();
  for (const edge of prereqEdges) {
    const list = adjacency.get(edge.fromSkillId) ?? [];
    list.push(edge.toSkillId);
    adjacency.set(edge.fromSkillId, list);
  }
  const visited = new Set<string>();
  const inStack = new Set<string>();
  function dfs(nodeId: string): boolean {
    if (inStack.has(nodeId)) return true;
    if (visited.has(nodeId)) return false;
    visited.add(nodeId);
    inStack.add(nodeId);
    for (const next of adjacency.get(nodeId) ?? []) {
      if (dfs(next)) {
        issues.push({ type: 'prerequisite_cycle', nodeId, message: `Cycle involving ${nodeId}` });
        return true;
      }
    }
    inStack.delete(nodeId);
    return false;
  }
  for (const nodeId of adjacency.keys()) {
    if (!visited.has(nodeId)) dfs(nodeId);
  }
  return issues;
}

function detectInvalidEdges(graph: SkillGraph): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  for (const edge of graph.edges) {
    if (!graph.nodes.has(edge.fromSkillId)) {
      issues.push({ type: 'invalid_edge', edgeId: edge.id, message: `Missing from: ${edge.fromSkillId}` });
    }
    if (!graph.nodes.has(edge.toSkillId)) {
      issues.push({ type: 'invalid_edge', edgeId: edge.id, message: `Missing to: ${edge.toSkillId}` });
    }
  }
  return issues;
}

// ─── Test Fixtures ───────────────────────────────────────────────────────────

function makeNode(overrides: Partial<SkillNode> & { id: string }): SkillNode {
  return {
    behavior: 'recall',
    skillCode: overrides.id,
    title: overrides.id,
    description: null,
    stage: 1,
    difficulty: 1,
    kind: 'core',
    protocolId: null,
    metadata: {},
    isActive: true,
    ...overrides,
  };
}

function makeEdge(from: string, to: string, edgeType: SkillEdge['edgeType'], id?: string): SkillEdge {
  return {
    id: id ?? `${from}->${to}`,
    fromSkillId: from,
    toSkillId: to,
    edgeType,
    conditionSummary: null,
    metadata: {},
  };
}

const recallNodes: SkillNode[] = [
  makeNode({ id: 'rc-attn', kind: 'foundation', stage: 1, difficulty: 1, protocolId: 'recall_s1' }),
  makeNode({ id: 'rc-name', kind: 'foundation', stage: 1, difficulty: 2, protocolId: 'recall_s1' }),
  makeNode({ id: 'rc-short', kind: 'core', stage: 2, difficulty: 2, protocolId: 'recall_s2' }),
  makeNode({ id: 'rc-distract', kind: 'core', stage: 2, difficulty: 3, protocolId: 'recall_s2' }),
  makeNode({ id: 'rc-outdoor', kind: 'core', stage: 3, difficulty: 3, protocolId: 'recall_s3' }),
  makeNode({ id: 'rc-proof', kind: 'proofing', stage: 4, difficulty: 4 }),
  makeNode({ id: 'rc-recover', kind: 'recovery', stage: 2, difficulty: 2 }),
  makeNode({ id: 'rc-diag', kind: 'diagnostic', stage: 1, difficulty: 1 }),
];

const recallEdges: SkillEdge[] = [
  makeEdge('rc-diag', 'rc-attn', 'prerequisite'),
  makeEdge('rc-attn', 'rc-name', 'advance'),
  makeEdge('rc-name', 'rc-short', 'advance'),
  makeEdge('rc-short', 'rc-distract', 'advance'),
  makeEdge('rc-distract', 'rc-outdoor', 'advance'),
  makeEdge('rc-outdoor', 'rc-proof', 'advance'),
  makeEdge('rc-short', 'rc-recover', 'regress'),
  makeEdge('rc-recover', 'rc-short', 'advance'),
  makeEdge('rc-attn', 'rc-short', 'detour'),
];

const graph = buildSkillGraph(recallNodes, recallEdges);

// ─── Skill Node Lookup ───────────────────────────────────────────────────────

test('getSkillNode returns node by id', () => {
  const node = getSkillNode(graph, 'rc-attn');
  assert.ok(node);
  assert.equal(node.id, 'rc-attn');
  assert.equal(node.kind, 'foundation');
});

test('getSkillNode returns null for unknown id', () => {
  assert.equal(getSkillNode(graph, 'nonexistent'), null);
});

// ─── Prerequisite Lookup ─────────────────────────────────────────────────────

test('getPrerequisiteSkills returns prerequisites for a node', () => {
  const prereqs = getPrerequisiteSkills(graph, 'rc-attn');
  assert.equal(prereqs.length, 1);
  assert.equal(prereqs[0].id, 'rc-diag');
});

test('getPrerequisiteSkills returns empty for nodes without prerequisites', () => {
  assert.equal(getPrerequisiteSkills(graph, 'rc-short').length, 0);
});

// ─── Advance Options ─────────────────────────────────────────────────────────

test('getAdvanceOptions returns next skills', () => {
  const options = getAdvanceOptions(graph, 'rc-name');
  assert.equal(options.length, 1);
  assert.equal(options[0].id, 'rc-short');
});

test('recovery node advances back to core', () => {
  const options = getAdvanceOptions(graph, 'rc-recover');
  assert.equal(options.length, 1);
  assert.equal(options[0].id, 'rc-short');
});

// ─── Regression Lookup ───────────────────────────────────────────────────────

test('getRegressionOptions returns regression targets', () => {
  const options = getRegressionOptions(graph, 'rc-short');
  assert.equal(options.length, 1);
  assert.equal(options[0].id, 'rc-recover');
  assert.equal(options[0].kind, 'recovery');
});

test('getRegressionOptions returns empty when no regression path', () => {
  assert.equal(getRegressionOptions(graph, 'rc-attn').length, 0);
});

// ─── Detour Lookup ───────────────────────────────────────────────────────────

test('getDetourOptions returns detour targets', () => {
  const options = getDetourOptions(graph, 'rc-attn');
  assert.equal(options.length, 1);
  assert.equal(options[0].id, 'rc-short');
});

test('getDetourOptions returns empty when no detours', () => {
  assert.equal(getDetourOptions(graph, 'rc-proof').length, 0);
});

// ─── Proofing Lookup ─────────────────────────────────────────────────────────

test('getProofingOptions returns empty when no proofing edges', () => {
  assert.equal(getProofingOptions(graph, 'rc-outdoor').length, 0);
});

// ─── Protocol Resolution (structural) ────────────────────────────────────────

test('executable core/foundation nodes have protocolId set', () => {
  for (const node of recallNodes) {
    if (node.kind === 'recovery' || node.kind === 'diagnostic' || node.kind === 'proofing') continue;
    assert.ok(node.protocolId, `Node "${node.id}" (${node.kind}) should have a protocolId`);
  }
});

// ─── Next Recommended ────────────────────────────────────────────────────────

test('getNextRecommendedSkills combines advance and proofing', () => {
  const next = getNextRecommendedSkills(graph, 'rc-outdoor');
  assert.equal(next.length, 1);
  assert.equal(next[0].id, 'rc-proof');
});

// ─── Skill Path ──────────────────────────────────────────────────────────────

test('getSkillPath returns ordered core progression excluding recovery/diagnostic', () => {
  const path = getSkillPath(graph, 'recall');
  const kinds = path.map((n) => n.kind);
  assert.ok(!kinds.includes('recovery'));
  assert.ok(!kinds.includes('diagnostic'));
  assert.ok(path.length >= 4);
  for (let i = 1; i < path.length; i++) {
    assert.ok(path[i].stage >= path[i - 1].stage, 'Path should be ordered by stage');
  }
});

// ─── Graph Validation ────────────────────────────────────────────────────────

test('valid graph has no orphan nodes', () => {
  const issues = detectOrphanNodes(graph, 'recall');
  assert.equal(issues.length, 0, `Orphans: ${issues.map((i) => i.message).join(', ')}`);
});

test('valid graph has no prerequisite cycles', () => {
  const issues = detectPrerequisiteCycles(graph, 'recall');
  assert.equal(issues.length, 0);
});

test('valid graph has no invalid edges', () => {
  const issues = detectInvalidEdges(graph);
  assert.equal(issues.length, 0);
});

test('detectOrphanNodes catches disconnected node', () => {
  const orphan = makeNode({ id: 'orphan-node', behavior: 'recall' });
  const orphanGraph = buildSkillGraph([orphan], []);
  const issues = detectOrphanNodes(orphanGraph, 'recall');
  assert.equal(issues.length, 1);
  assert.equal(issues[0].type, 'orphan_node');
});

test('detectPrerequisiteCycles catches cycles', () => {
  const nodes = [makeNode({ id: 'cycle-a' }), makeNode({ id: 'cycle-b' })];
  const edges = [
    makeEdge('cycle-a', 'cycle-b', 'prerequisite'),
    makeEdge('cycle-b', 'cycle-a', 'prerequisite'),
  ];
  const cycleGraph = buildSkillGraph(nodes, edges);
  const issues = detectPrerequisiteCycles(cycleGraph, 'recall');
  assert.ok(issues.length > 0);
  assert.equal(issues[0].type, 'prerequisite_cycle');
});

test('detectInvalidEdges catches edges pointing to missing nodes', () => {
  const nodes = [makeNode({ id: 'existing' })];
  const edges = [makeEdge('existing', 'ghost', 'advance')];
  const badGraph = buildSkillGraph(nodes, edges);
  const issues = detectInvalidEdges(badGraph);
  assert.equal(issues.length, 1);
  assert.equal(issues[0].type, 'invalid_edge');
});
