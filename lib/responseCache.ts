/**
 * LRU (Least Recently Used) in-memory response cache for Gemini answers.
 *
 * Purpose: Avoid hitting Gemini for identical first-turn questions.
 *   "How do I register to vote?" is asked thousands of times — cache it.
 *
 * Scope: Only first-turn messages (empty history) are cached.
 *   Multi-turn conversations are never cached — each is unique context.
 *
 * TTL: Cached entries expire after CACHE_TTL_MS (default 1 hour).
 * Size: Max CACHE_MAX_SIZE entries; oldest evicted when full (LRU).
 */

import { createHash } from "crypto";
import { CACHE_MAX_SIZE, CACHE_TTL_MS } from "@/lib/constants";

interface CacheEntry {
  response: string;
  expiresAt: number;
}

/** Doubly-linked list node for O(1) LRU eviction */
interface LRUNode {
  key: string;
  value: CacheEntry;
  prev: LRUNode | null;
  next: LRUNode | null;
}

class LRUCache {
  private readonly map = new Map<string, LRUNode>();
  private head: LRUNode | null = null; // most recently used
  private tail: LRUNode | null = null; // least recently used
  private readonly maxSize: number;
  private readonly ttlMs: number;

  constructor(maxSize: number, ttlMs: number) {
    this.maxSize = maxSize;
    this.ttlMs = ttlMs;
  }

  get(key: string): string | null {
    const node = this.map.get(key);
    if (!node) return null;

    // Check expiry
    if (Date.now() > node.value.expiresAt) {
      this.remove(node);
      return null;
    }

    // Move to head (most recently used)
    this.moveToHead(node);
    return node.value.response;
  }

  set(key: string, response: string): void {
    const existing = this.map.get(key);
    if (existing) {
      existing.value = { response, expiresAt: Date.now() + this.ttlMs };
      this.moveToHead(existing);
      return;
    }

    const node: LRUNode = {
      key,
      value: { response, expiresAt: Date.now() + this.ttlMs },
      prev: null,
      next: this.head,
    };

    if (this.head) this.head.prev = node;
    this.head = node;
    if (!this.tail) this.tail = node;

    this.map.set(key, node);

    // Evict LRU if over capacity
    if (this.map.size > this.maxSize && this.tail) {
      this.remove(this.tail);
    }
  }

  private remove(node: LRUNode): void {
    if (node.prev) node.prev.next = node.next;
    else this.head = node.next;

    if (node.next) node.next.prev = node.prev;
    else this.tail = node.prev;

    this.map.delete(node.key);
  }

  private moveToHead(node: LRUNode): void {
    if (node === this.head) return;
    this.remove(node);
    node.prev = null;
    node.next = this.head;
    if (this.head) this.head.prev = node;
    this.head = node;
    if (!this.tail) this.tail = node;
    this.map.set(node.key, node);
  }

  /** Returns current number of valid (non-expired) cached entries */
  get size(): number {
    return this.map.size;
  }
}

// Module-level singleton cache
const cache = new LRUCache(CACHE_MAX_SIZE, CACHE_TTL_MS);

/**
 * Generates a deterministic cache key for a first-turn message.
 * Uses SHA-256 so long messages don't bloat the key store.
 */
export function getCacheKey(message: string): string {
  return createHash("sha256")
    .update(message.toLowerCase().trim())
    .digest("hex")
    .slice(0, 32); // 128-bit prefix is collision-safe for this use case
}

/**
 * Returns a cached response for a first-turn message, or null if not cached.
 * Never call this for multi-turn conversations.
 */
export function getCachedResponse(message: string): string | null {
  return cache.get(getCacheKey(message));
}

/**
 * Caches a fully-assembled response string for a first-turn message.
 * Only call this after the full stream has been collected.
 */
export function setCachedResponse(message: string, response: string): void {
  cache.set(getCacheKey(message), response);
}

/** Returns the current cache size (for observability/debugging) */
export function getCacheSize(): number {
  return cache.size;
}
