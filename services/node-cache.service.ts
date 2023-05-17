import NodeCache from 'node-cache'

export const nodeCache = new NodeCache({
  stdTTL: 60 * 60 * 24 * 7, // 7 day
})
