export interface IAuthSession {
  codeVerifier: string
  authNonce: {
    [index: string]: string
  }
}
