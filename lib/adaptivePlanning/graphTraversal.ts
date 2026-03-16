import type { SkillNode, SkillEdge } from '../../types/index.ts';
import type { Protocol } from '../../constants/protocols.ts';
import {
  type SkillGraph,
  getSkillNode,
  getEdgesFrom,
  getEdgesTo,
  getExecutableProtocolForSkill,
} from './skillGraph.ts';

function resolveTargetNodes(graph: SkillGraph, edges: SkillEdge[], direction: 'to' | 'from'): SkillNode[] {
  const results: SkillNode[] = [];
  for (const edge of edges) {
    const targetId = direction === 'to' ? edge.toSkillId : edge.fromSkillId;
    const node = getSkillNode(graph, targetId);
    if (node && node.isActive) results.push(node);
  }
  return results;
}

export function getPrerequisiteSkills(graph: SkillGraph, skillId: string): SkillNode[] {
  const incomingPrereqs = getEdgesTo(graph, skillId, 'prerequisite');
  return resolveTargetNodes(graph, incomingPrereqs, 'from');
}

export function getAdvanceOptions(graph: SkillGraph, skillId: string): SkillNode[] {
  const advanceEdges = getEdgesFrom(graph, skillId, 'advance');
  return resolveTargetNodes(graph, advanceEdges, 'to');
}

export function getRegressionOptions(graph: SkillGraph, skillId: string): SkillNode[] {
  const regressEdges = getEdgesFrom(graph, skillId, 'regress');
  return resolveTargetNodes(graph, regressEdges, 'to');
}

export function getDetourOptions(graph: SkillGraph, skillId: string): SkillNode[] {
  const detourEdges = getEdgesFrom(graph, skillId, 'detour');
  return resolveTargetNodes(graph, detourEdges, 'to');
}

export function getProofingOptions(graph: SkillGraph, skillId: string): SkillNode[] {
  const proofingEdges = getEdgesFrom(graph, skillId, 'proofing');
  return resolveTargetNodes(graph, proofingEdges, 'to');
}

export function getProtocolForSkill(graph: SkillGraph, skillId: string): Protocol | null {
  return getExecutableProtocolForSkill(skillId, graph);
}

export function getNextRecommendedSkills(graph: SkillGraph, skillId: string): SkillNode[] {
  const advance = getAdvanceOptions(graph, skillId);
  const proofing = getProofingOptions(graph, skillId);
  return [...advance, ...proofing];
}

export function getSkillPath(graph: SkillGraph, behavior: string): SkillNode[] {
  const nodes = [...graph.nodes.values()].filter(
    (n) => n.behavior === behavior && n.isActive && n.kind !== 'recovery' && n.kind !== 'diagnostic'
  );
  return nodes.sort((a, b) => a.stage - b.stage || a.difficulty - b.difficulty);
}
