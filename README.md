# sgID Sample Application

This is an example node application that implements sgID's OAuth2 API.

You can find the documentation on sgID's APIs [here](https://app.swaggerhub.com/apis-docs/ogp/sgID/1.0.0).

Before you begin:

* Fill up and submit this [form](https://form.gov.sg/5d6642c12efdae00125764b1). 
* In the "callback URL" field, enter "http://localhost:8080/oauth/redirect". Once you register, you will get a client ID and client secret.

Running the app:

1. In your terminal, run the commands 
```
git clone git@github.com:opengovsg/sgID-test-app.git
cd sgID-test-app
```
2. Create a ".env" file in the root directory of the folder and replace the values based on your setup. 
```
ENVIRONMENT=<<INSERT ENVIRONMENT HERE>>
CLIENT_ID=<<INSERT CLIENT ID HERE>>
CLIENT_SECRET=<<INSERT CLIENT SECRET HERE>>
PORT=8080
REDIRECT_URL=<<INSERT REDIRECT URL HERE>>
PRIVATE_KEY=<<INSERT PRIVATE KEY HERE>>
```

3. Install dependencies by executing: `npm install`.
4. Start the server by executing `npm start`
5. Navigate to http://localhost:8080 on your browser.


