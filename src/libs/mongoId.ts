/**
 * mongoId.ts — MongoDB ID normalization utilities
 *
 * This file is shared across both frontend and backend to ensure
 * consistent ID comparison logic.
 */

type MongoIdLike = string | { toString(): string } | null | undefined;

/**
 * shapeIntoMongoId
 * Converts any MongoDB ID representation into a plain lowercase hex string.
 * Returns null if the input is null or undefined.
 */
export function shapeIntoMongoId(id: MongoIdLike): string | null {
    if (id === null || id === undefined) return null;
    try {
        return id.toString().trim().toLowerCase();
    } catch {
        return null;
    }
}

/**
 * mongoIdsMatch
 * Returns true if two MongoDB ID values refer to the same document.
 */
export function mongoIdsMatch(a: MongoIdLike, b: MongoIdLike): boolean {
    const sa = shapeIntoMongoId(a);
    const sb = shapeIntoMongoId(b);
    if (!sa || !sb) return false;
    return sa === sb;
}
