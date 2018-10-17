# zebitex-node
Node.js client for Zebitex exchange API

[API documentation](https://doc.zebitex.com/)

## Getting started

* Generate api keys: https://zebitex.com/profile/api-tokens (use https://staging.zebitex.com/ for testing environnement)

```
const ApiClient = require('zebitex-node') 
const testEnv = true // set to false to use in production
const client = new ApiClient('<Access key>', '<Secret key>', TestEnv) // instanciate your client 
```

* retrieve you assets balances
```
client.fund()

```

* open a new order
```
client.newOrder('ltc', // quote currency
  'btc', // base currency
  'ask', // order side (bid or ask)
  '0.321', // price
  '0.123', // volume
  'ltcbtc', // market
  'limit' // order type
).then(console.log)
```

* cancel opened order
```
let orderId=1234
client.cancelOrder(order).then(console.log)

```
