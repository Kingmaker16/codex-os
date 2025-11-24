/**
 * Knowledge Engine v2.5 - Knowledge Graph
 * 
 * Manages relations and linking between knowledge blocks
 */

import type { KnowledgeBlock, KnowledgeRelation } from "./types.js";

export function findSimilarBlocks(block: KnowledgeBlock, allBlocks: KnowledgeBlock[]): string[] {
  const similar: string[] = [];
  const blockKeywords = new Set(block.keywords);

  for (const other of allBlocks) {
    if (other.id === block.id) continue;

    const otherKeywords = new Set(other.keywords);
    const intersection = new Set([...blockKeywords].filter(k => otherKeywords.has(k)));
    const similarity = intersection.size / Math.max(blockKeywords.size, otherKeywords.size);

    if (similarity > 0.3) {
      similar.push(other.id);
    }
  }

  return similar;
}

export function linkKnowledgeBlocks(blocks: KnowledgeBlock[]): void {
  for (const block of blocks) {
    block.relations = findSimilarBlocks(block, blocks);
  }
}

export function buildRelations(blocks: KnowledgeBlock[]): KnowledgeRelation[] {
  const relations: KnowledgeRelation[] = [];

  for (const block of blocks) {
    for (const relatedId of block.relations) {
      relations.push({
        from: block.id,
        to: relatedId,
        type: "similar",
        strength: 0.7
      });
    }
  }

  return relations;
}
