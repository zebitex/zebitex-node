const _ = require('lodash')
const request = require('request-promise')
const crypto = require('crypto')



function Zebitex(apiKey, apiSecret, isDev){
  this.key = apiKey
  this.secret = apiSecret
  this.url = isDev ? "https://staging.zebitex.com/api/v1/" : "https://zebitex.com/api/v1/"

}

Zebitex.prototype._getPublicRequest = function (path,query){
  let opts = {
    uri: this.url+path,
    qs: query,
    json:true
  }
  return request(opts)
}

Zebitex.prototype.tickers = function(){
  return this._getPublicRequest('orders/tickers')
}

Zebitex.prototype.ticker = function(market){
  if(!market) throw new Error('no market provided')

  return this._getPublicRequest('orders/ticker_summary/'+market)
}

Zebitex.prototype.orderbook = function (market){
  if(!market) throw new Error('no market provided')
  
  return this._getPublicRequest('orders/orderbook/', {market:market})
}

Zebitex.prototype.trade_history = function (market){
  if(!market) throw new Error('no market provided')
  
  return this._getPublicRequest('orders/trade_history/', {market:market})
}

//Zebitex.prototype.
module.exports=Zebitex
