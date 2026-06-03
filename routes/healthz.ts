import express from 'express'

/**
 * Lightweight liveness probe for the load balancer / Elastic Beanstalk
 * health check. Returns a plain 200 and deliberately touches no sessions
 * or downstream sgID services, so health stays deterministic and can't be
 * tripped by upstream issues or counted against the 4xx/5xx metrics.
 */
export const healthz = (_req: express.Request, res: express.Response) => {
  res.status(200).type('text/plain').send('OK')
}
