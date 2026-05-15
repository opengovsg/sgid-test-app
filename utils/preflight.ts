/**
 * Fail fast with a clear, named error if required env vars are missing.
 *
 * Imported as a bare side-effect from `index.ts` so it runs before any
 * downstream module that would otherwise crash inside a third-party
 * library with a less obvious stack trace.
 */
const required = ['CLIENT_ID', 'CLIENT_SECRET', 'PRIVATE_KEY', 'HOSTNAME'] as const

const missing = required.filter((k) => !process.env[k])

if (missing.length > 0) {
  console.error(
    `Missing required environment variables: ${missing.join(', ')}. ` +
      `Set them on the deployment environment before starting the app.`,
  )
  process.exit(1)
}
