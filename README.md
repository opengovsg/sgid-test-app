# sgID Test Application

This is an example node application that implements sgID's OAuth2 API.

Running the app:

1. Generate public private key pair by running
   ```
   openssl genrsa -out private.pem 2048 && openssl rsa -in private.pem -outform PEM -pubout -out public.pem
   ```
1. Ensure client is registered in server db with public key and redirect url (http://localhost:10000)
1. Refer to .env.example to create .env file
1. Private key, client id, client secret and scopes should be set in .env
1. Start nodemon by running `npm run dev`
1. Navigate to http://localhost:10000 on your browser.
