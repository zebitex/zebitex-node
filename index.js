const request = require('request-promise')
const crypto = require('crypto')

function Zebitex (apiKey, apiSecret, isDev) {
  this.key = apiKey
  this.secret = apiSecret
  this.url = isDev ? 'https://staging.zebitex.com/' : 'https://zebitex.com/'
  // this.url = 'http://localhost:3000/' //isDev ? "https://staging.zebitex.com/" : "https://zebitex.com/"
}

Zebitex.prototype._getPublicRequest = function (path, query) {
  let opts = {
    uri: this.url + path,
    qs: query,
    json: true
  }
  return request(opts)
}

Zebitex.prototype._signRequest = function (params) {
  let payload = [ params.method, '/' + params.path, params.nonce, JSON.stringify(params.query) ].join('|')
  let hash = crypto.createHmac('sha256', this.secret).update(payload).digest('hex')
  return hash
}

Zebitex.prototype._buildAuthHeader = function (nonce, query, signature) {
  let params = query ? Object.keys(query).join(';') : ''
  let header = `ZEBITEX-HMAC-SHA256 access_key=${this.key}, signature=${signature}, tonce=${nonce}, signed_params=${params}`

  return { 'Authorization': header }
}

Zebitex.prototype._privateRequest = function (method, path, query) {
  let nonce = Date.now()
  let signature = this._signRequest({ method, path, query, nonce })
  let authHeader = this._buildAuthHeader(nonce, query, signature)

  let opts = {
    method: method,
    uri: this.url + path,
    headers: authHeader,
    json: true
  }

  if (method === 'GET') {
    opts.qs = query
  } else {
    opts.body = query
  }
  return request(opts)
}

Zebitex.prototype._getPrivateRequest = function (path, query) {
  return this._privateRequest('GET', path, query)
}

Zebitex.prototype._postPrivateRequest = function (path, query) {
  return this._privateRequest('POST', path, query)
}

Zebitex.prototype._deletePrivateRequest = function (path, query) {
  return this._privateRequest('DELETE', path, query)
}

Zebitex.prototype.tickers = function () {
  return this._getPublicRequest('api/v1/orders/tickers')
}

Zebitex.prototype.ticker = function (market) {
  if (!market) throw new Error('no market provided')

  return this._getPublicRequest('api/v1/orders/ticker_summary/' + market)
}

Zebitex.prototype.orderbook = function (market) {
  if (!market) throw new Error('no market provided')

  return this._getPublicRequest('api/v1/orders/orderbook/', { market: market })
}

Zebitex.prototype.trade_history = function (market) {
  if (!market) throw new Error('no market provided')

  return this._getPublicRequest('api/v1/orders/trade_history/', { market: market })
}

Zebitex.prototype.funds = function () {
  return this._getPrivateRequest('api/v1/funds')
}
Zebitex.prototype.fundingHistory = function (code, type) {
  return this._getPrivateRequest('api/v1/funds/history', { code, type })
}
// Zebitex.prototype.
module.exports = Zebitex
