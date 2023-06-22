import helmet from 'helmet'

const csp = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      baseUri: ["'self'"],
      blockAllMixedContent: [],
      fontSrc: ["'self'", 'https://fonts.gstatic.com'],
      frameAncestors: ["'self'"],
      imgSrc: ["'self'", 'data:'],
      objectSrc: ["'none'"],
      styleSrc: [
        "'self'",
        'https://fonts.googleapis.com',
        'https://stackpath.bootstrapcdn.com',
      ],
      scriptSrcAttr: ["'none'"],
      scriptSrc: ["'self'"],
      upgradeInsecureRequests: [],
    },
  },
})

export { csp }
