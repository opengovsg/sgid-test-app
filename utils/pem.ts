/**
 * Rehydrate a PEM block whose newlines have been flattened to spaces.
 *
 * Some sources strip real newlines from env-var values as they pass through
 * (EB console paste, AWS CLI without `--cli-input-json`, some secrets
 * managers). `node-rsa` (used by `@opengovsg/sgid-client` for its
 * PKCS#1 -> PKCS#8 conversion) is strict about PEM formatting and throws
 * `Invalid RSA private key` if the body isn't on separate lines. This
 * function turns
 *
 *   "-----BEGIN RSA PRIVATE KEY----- MIIEow...== -----END RSA PRIVATE KEY-----"
 *
 * back into a standard PEM with a header line, 64-char-wide base64 lines,
 * and a footer line. Input that already contains newlines is returned
 * unchanged.
 */
export const normalisePem = (raw: string | undefined): string => {
  if (!raw) return ''
  if (raw.includes('\n')) return raw

  const match = raw.match(/-----BEGIN ([^-]+)-----\s*(.+?)\s*-----END \1-----/)
  if (!match) return raw

  const label = match[1].trim()
  const body = match[2].replace(/\s+/g, '')
  const wrapped = body.match(/.{1,64}/g)?.join('\n') ?? body
  return `-----BEGIN ${label}-----\n${wrapped}\n-----END ${label}-----\n`
}
