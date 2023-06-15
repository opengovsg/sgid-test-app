import NodeCache from 'node-cache'

/**
 * In-memory store for session data.
 * In a real application, this would be a database.
 */
export const nodeCache = new NodeCache({
  stdTTL: 60 * 60 * 24 * 7, // 7 days
})
