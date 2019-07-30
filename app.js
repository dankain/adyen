const fs = require('fs');
const http = require('http');
const https = require('https');
const privateKey  = fs.readFileSync('sslcert/key.pem', 'utf8');
const certificate = fs.readFileSync('sslcert/cert.pem', 'utf8');
const credentials = {key: privateKey, cert: certificate};

const express = require('express');
const axios = require('axios');

const app = express();
const port = 3000;

let paymentMethodsResponse;

axios({
  method: 'post',
  url: 'https://checkout-test.adyen.com/v49/paymentMethods',
  headers: {
    'x-API-key': '...',
    'content-type': 'application/json'
  },
  data: {
    merchantAccount: "Cabiri51491",
    countryCode: "GB",
    amount: {
      currency: "GBP",
      value: 1000
    },
    channel: "Web"
  }
})
  .then(response => {
    console.log(response.data);
    paymentMethodsResponse = response.data;
  })
  .catch(error => {
    console.log(error)
  });


app.get('/', (req, res) => res.send(
  '<html>\n' +
  '<body>\n' +
  '<div id="dropin"></div>\n' +
  '<script src="https://checkoutshopper-test.adyen.com/checkoutshopper/sdk/3.0.0/adyen.js"></script>\n' +
  `<script>
     const configuration = {
      locale: "en_GB",
      environment: "test",
      originKey: "pub.v2.8015643980141000.aHR0cHM6Ly9jYWJpcmkuZGV2LmNvbTo4NDQzLw.2ZouCNFAtSkna0BxEKTebBYuxCj22pUxMtFb3mlCqTI",
      paymentMethodsResponse: ${JSON.stringify(paymentMethodsResponse)},
    };
    const checkout = new AdyenCheckout(configuration);
    
    const makePayment = data => {
      console.log('makePayment', data);
    }
        
    const makeDetailsCall = data => {
      console.log('makeDetailsCall', data);
    }
    
    const dropin = checkout
    .create('dropin', {
      paymentMethodsConfiguration: {
        applepay: { //Example configuration
          configuration: { //Required configuration for Apple Pay
            merchantName: 'Adyen Test merchant', // Name to be displayed on the form
            merchantIdentifier: 'adyen.test.merchant' // Your Apple merchant identifier as described https://developer.apple.com/documentation/apple_pay_on_the_web/applepayrequest/2951611-merchantidentifier
          },
        },
        card: { //Example optional configuration for Cards
          hasHolderName: true,
          holderNameRequired: true,
          enableStoreDetails: true,
          name: 'Credit or debit card'
        }
      },
      onSubmit: (state, dropin) => {
        makePayment(state.data)
          // Your function calling your server to make the /payments request
          .then(action => {
            dropin.handleAction(action);
            // Drop-in will handle the action object from the /payments response
          })
          .catch(error => {
            throw Error(error);
          });
        },
      onAdditionalDetails: (state, dropin) => {
        makeDetailsCall(state.data)
          // Your function calling your server to make a /payments/details request
          .then(action => {
            dropin.handleAction(action);
            // Drop-in will handle the action object from the /payments/details response
          })
          .catch(error => {
            throw Error(error);
          });
        }
    })
    .mount('#dropin');
    
    

</script>\n` +
  '<link rel="stylesheet" href="https://checkoutshopper-test.adyen.com/checkoutshopper/sdk/3.0.0/adyen.css"/>\n' +
  '<p>Hello</p>\n' +
  '</body>\n' +
  '</html>'));

const httpServer = http.createServer(app);
const httpsServer = https.createServer(credentials, app);

httpServer.listen(8080);
httpsServer.listen(8443);