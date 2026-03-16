import { PROTOCOLS_BY_ID } from '../../constants/protocols';
import type { SkillGraph } from './skillGraph';

export interface ValidationIssue {
  type: 'missing_protocol' | 'orphan_node' | 'prerequisite_cycle' | 'invalid_edge';
  nodeId?: string;
  edgeId?: string;
  message: string;
}

export function validateSkillGraphForBehavior(graph: SkillGraph, behavior: string): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  const behaviorNodes = [...graph.nodes.values()].filter((n) => n.behavior === behavior);
  if (behaviorNodes.length === 0) {
    issues.push({ type: 'orphan_node', message: `No nodes found for behavior: ${behavior}` });
    return issues;
  }

  issues.push(...detectMissingProtocols(graph, behavior));
  issues.push(...detectOrphanNodes(graph, behavior));
  issues.push(...detectPrerequisiteCycles(graph, behavior));
  issues.push(...detectInvalidEdges(graph));

  return issues;
}

export function detectMissingProtocols(graph: SkillGraph, behavior: string): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  for (const node of graph.nodes.values()) {
    if (node.behavior !== behavior) continue;
    if (node.kind === 'recovery' || node.kind === 'diagnostic') continue;
    if (node.kind === 'proofing' && !node.protocolId) continue;
    if (!node.protocolId) {
      issues.push({
        type: 'missing_protocol',
        nodeId: node.id,
        message: `Executable node "${node.id}" (${node.title}) has no protocol_id`,
      });
      continue;
    }
    if (!PROTOCOLS_BY_ID[node.protocolId]) {
      issues.push({
        type: 'missing_protocol',
        nodeId: node.id,
        message: `Node "${node.id}" references protocol "${node.protocolId}" which does not exist`,
      });
    }
  }
  return issues;
}

export function detectOrphanNodes(graph: SkillGraph, behavior: string): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const behaviorNodes = [...graph.nodes.values()].filter((n) => n.behavior === behavior);
  const connectedIds = new Set<string>();

  for (const edge of graph.edges) {
    connectedIds.add(edge.fromSkillId);
    connectedIds.add(edge.toSkillId);
  }

  for (const node of behaviorNodes) {
    if (!connectedIds.has(node.id)) {
      issues.push({
        type: 'orphan_node',
        nodeId: node.id,
        message: `Node "${node.id}" (${node.title}) has no edges — orphan in ${behavior} graph`,
      });
    }
  }
  return issues;
}

export function detectPrerequisiteCycles(graph: SkillGraph, behavior: string): ValidationIssue[] {
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
        issues.push({
          type: 'prerequisite_cycle',
          nodeId,
          message: `Prerequisite cycle detected involving node "${nodeId}" in ${behavior} graph`,
        });
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

export function detectInvalidEdges(graph: SkillGraph): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  for (const edge of graph.edges) {
    if (!graph.nodes.has(edge.fromSkillId)) {
      issues.push({
        type: 'invalid_edge',
        edgeId: edge.id,
        message: `Edge "${edge.id}" references missing from_skill_id "${edge.fromSkillId}"`,
      });
    }
    if (!graph.nodes.has(edge.toSkillId)) {
      issues.push({
        type: 'invalid_edge',
        edgeId: edge.id,
        message: `Edge "${edge.id}" references missing to_skill_id "${edge.toSkillId}"`,
      });
    }
  }
  return issues;
}

export function validateFullGraph(graph: SkillGraph): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const behaviors = new Set<string>();
  for (const node of graph.nodes.values()) {
    behaviors.add(node.behavior);
  }
  for (const behavior of behaviors) {
    issues.push(...validateSkillGraphForBehavior(graph, behavior));
  }
  return issues;
}
