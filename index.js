const axios = require('axios')
const crypto = require('crypto')
function Zebitex (apiKey, apiSecret, isDev) {
  this.key = apiKey
  this.secret = apiSecret
  this.url = isDev ? 'https://api-staging.zebitex.com/' : 'https://zebitex.com/'
}

Zebitex.prototype._getPublicRequest = async function (path, query) {
  const opts = {
    url: this.url + path,
    data: query,
    json: true
  }
  try {
    const req = await axios.request(opts)
    return req.data
  } catch (e) {
    return (e.response.data)
  }
}

Zebitex.prototype._signRequest = function (params) {
  const args = params.query ? JSON.stringify(params.query) : '{}'
  const payload = [params.method, '/' + params.path, params.nonce, args].join('|')
  const hash = crypto.createHmac('sha256', this.secret).update(payload).digest('hex')
  return hash
}

Zebitex.prototype._buildAuthHeader = function (nonce, query, signature) {
  const params = query ? Object.keys(query).join(';') : ''
  const header = `ZEBITEX-HMAC-SHA256 access_key=${this.key}, signature=${signature}, tonce=${nonce}, signed_params=${params}`

  return { Authorization: header }
}

Zebitex.prototype._privateRequest = async function (method, path, query) {
  const nonce = Date.now()
  const signature = this._signRequest({ method, path, query, nonce })
  const authHeader = this._buildAuthHeader(nonce, query, signature)

  const opts = {
    method: method,
    url: this.url + path,
    headers: authHeader,
    json: true
  }

  if (method === 'GET') {
    opts.data = query
  } else {
    opts.data = query
  }

  try {
    const req = await axios.request(opts)
    return req.data
  } catch (e) {
    return (e.response.data)
  }
}

Zebitex.prototype._getPrivateRequest = async function (path, query) {
  return await this._privateRequest('GET', path, query)
}

Zebitex.prototype._postPrivateRequest = async function (path, query) {
  return await this._privateRequest('POST', path, query)
}

Zebitex.prototype._deletePrivateRequest = async function (path, query) {
  return await this._privateRequest('DELETE', path, query)
}

Zebitex.prototype.getSessionInfo = async function () {
  return await this._getPrivateRequest('api/V1/sessions/info')
}

Zebitex.prototype.authWss = async function (socketId, channelName) {
  return await this._postPrivateRequest('api/V1/pusher/auth', { channelName, socketId })
}

Zebitex.prototype.tickers = async function () {
  return await this._getPublicRequest('api/v1/orders/tickers')
}

Zebitex.prototype.ticker = async function (market) {
  if (!market) throw new Error('no market provided')

  return await this._getPublicRequest('api/v1/orders/ticker_summary/' + market)
}

Zebitex.prototype.orderbook = async function (market) {
  if (!market) throw new Error('no market provided')

  return await this._getPublicRequest('api/v1/orders/orderbook', { market: market })
}

Zebitex.prototype.publicTradeHistory = async function (market) {
  if (!market) throw new Error('no market provided')

  return await this._getPublicRequest('api/v1/orders/trade_history', { market: market })
}

Zebitex.prototype.funds = async function () {
  return await this._getPrivateRequest('api/v1/funds')
}

Zebitex.prototype.fundingHistory = async function (code, type) {
  return await this._getPrivateRequest('api/v1/funds/history', { code, type })
}

Zebitex.prototype.accountHistory = async function (start_date, end_date, page, per) {
  return await this._getPrivateRequest('api/v1/history/account', { start_date, end_date, page, per })
}

Zebitex.prototype.orderHistory = async function ({ per, cursor }) {
  return await this._getPrivateRequest('api/v1/history/orders', { per, cursor })
}

Zebitex.prototype.tradeHistory = async function ({ per, cursor }) {
  return await this._getPrivateRequest('api/v1/history/trades', { per, cursor })
}

Zebitex.prototype.openOrders = async function (page, per) {
  return await this._getPrivateRequest('api/v1/orders/current', { page, per })
}

Zebitex.prototype.cancelAllOrders = async function () {
  return await this._deletePrivateRequest('api/v1/orders/cancel_all')
}

Zebitex.prototype.cancelOrder = async function (id) {
  return await this._deletePrivateRequest('api/v1/orders/' + id + '/cancel', { id: id.toString() })
}

Zebitex.prototype.newOrder = async function (bid, ask, side, price, amount, market, ord_type) {
  return await this._postPrivateRequest('api/v1/orders', { bid, ask, side, price, amount, market, ord_type })
}

Zebitex.prototype.create_buy_limit_order = async function (price, amount) {
  return await this.newOrder(
    'usdt', // quote currency
    'btc', // base currency
    'bid', // order side (bid or ask)
    price, // price
    amount / price, // volume
    'btcusdt', // market
    'limit')
}

Zebitex.prototype.create_sell_limit_order = async function (price, amount) {
  return await this.newOrder(
    'usdt', // quote currency
    'btc', // base currency
    'ask', // order side (bid or ask)
    price, // price
    amount / price, // volume
    'btcusdt', // market
    'limit')
}

Zebitex.prototype.create_sell_market_order = async function (amount) {
  // NB this is an emulation that just hit best bid hence it can fail
  // in case of adversial price movement
  const book = await this.orderbook('btcusdt')
  const best_bid = book.bids[0][0]

  return await this.newOrder(
    'usdt', // quote currency
    'btc', // base currency
    'ask', // order side (bid or ask)
    best_bid, // price
    amount / best_bid, // volume
    'btcusdt', // market
    'limit')
}

Zebitex.prototype.create_buy_market_order = async function (amount) {
  // NB this is an emulation that just hit best ask hence it can fail
  // in case of adversial price movement
  const book = await this.orderbook('btcusdt')
  const best_ask = book.asks[0][0]

  return await this.newOrder(
    'usdt', // quote currency
    'btc', // base currency
    'bid', // order side (bid or ask)
    best_ask, // price
    amount / best_ask, // volume
    'btcusdt', // market
    'limit')
}
module.exports = Zebitex
