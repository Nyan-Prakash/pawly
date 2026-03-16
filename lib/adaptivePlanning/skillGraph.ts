import { PROTOCOLS_BY_ID } from '../../constants/protocols.ts';
import type { Protocol } from '../../constants/protocols.ts';
import type { SkillNode, SkillEdge, SkillEdgeType } from '../../types/index.ts';

export interface SkillGraph {
  nodes: Map<string, SkillNode>;
  edges: SkillEdge[];
}

export function buildSkillGraph(nodes: SkillNode[], edges: SkillEdge[]): SkillGraph {
  const nodeMap = new Map<string, SkillNode>();
  for (const node of nodes) {
    nodeMap.set(node.id, node);
  }
  return { nodes: nodeMap, edges };
}

export function getSkillNode(graph: SkillGraph, skillId: string): SkillNode | null {
  return graph.nodes.get(skillId) ?? null;
}

export function getEdgesFrom(graph: SkillGraph, skillId: string, edgeType?: SkillEdgeType): SkillEdge[] {
  return graph.edges.filter(
    (e) => e.fromSkillId === skillId && (edgeType === undefined || e.edgeType === edgeType)
  );
}

export function getEdgesTo(graph: SkillGraph, skillId: string, edgeType?: SkillEdgeType): SkillEdge[] {
  return graph.edges.filter(
    (e) => e.toSkillId === skillId && (edgeType === undefined || e.edgeType === edgeType)
  );
}

export function getNodesForBehavior(graph: SkillGraph, behavior: string): SkillNode[] {
  const result: SkillNode[] = [];
  for (const node of graph.nodes.values()) {
    if (node.behavior === behavior && node.isActive) {
      result.push(node);
    }
  }
  return result.sort((a, b) => a.stage - b.stage || a.difficulty - b.difficulty);
}

export function getExecutableProtocolForSkill(skillId: string, graph: SkillGraph): Protocol | null {
  const node = graph.nodes.get(skillId);
  if (!node?.protocolId) return null;
  return PROTOCOLS_BY_ID[node.protocolId] ?? null;
}

export function getAllBehaviors(graph: SkillGraph): string[] {
  const behaviors = new Set<string>();
  for (const node of graph.nodes.values()) {
    behaviors.add(node.behavior);
  }
  return [...behaviors].sort();
}
