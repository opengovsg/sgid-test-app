# sgID Sample Application

This is an example node application that implements sgID's OAuth2 API.

Before you begin, you can find the documentation on sgID's APIs [here](https://app.swaggerhub.com/apis-docs/ogp/sgID/1.0.0).

## Getting started

In order to run the application:

1. Fill up and submit this form : [Link](https://form.gov.sg/5d6642c12efdae00125764b1). In the "callback URL" field, enter "http://localhost:8080/oauth/redirect". Once you register, you will get a client ID and client secret.
2. Replace the values of the `clientID` and `clientSecret` variables in the [index.js](/index.js) file 
3. Install dependencies by executing: `npm install` or `yarn`.
4. Start the server by executing `node index.js`
5. Navigate to http://localhost:8080 on your browser.
