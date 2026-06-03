// Aggregates all test files so the test runner can discover them
// in a single entrypoint. node:test registers tests at import-time,
// so importing each suite here is enough.

import './utils.test'
import './utils.pem.test'
import './routes/profile.test'
import './routes/home.test'
import './routes/callback.test'
import './routes/healthz.test'
import './middlewares/csp.test'
