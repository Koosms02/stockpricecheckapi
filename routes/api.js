'use strict';
const stock = require("../models/stock")
const os = require("os");
const bcrypt = require("bcrypt");
const { validateHeaderName } = require("http");


const saltRound = 12;

module.exports = function (app) {

  app.route('/api/stock-prices')
    .get(async function (req, res) {

      const { stock: StockSymbols, like } = req.query;
      const stocks = Array.isArray(StockSymbols) ? StockSymbols : [StockSymbols];

      //check if the stock 
      const isValid = await validateStockSymbols(stocks);


      if (isValid === "Invalid symbol" || isValid === "Unknown symbol") {
        res.status(500).json({ message: "Invalid symbol" })
      } else {

        if (stocks.length === 1) {
          handleSingleStock(stocks[0], like, res)
        } else if (stocks.length === 2) {
          handleDoubleStock(stocks[0], stocks[1], like, res)
        } else {
          res.status(400).json({ "message": "invalid symbol" });
        }
      }
    });
};

// Function to validate stock symbols
async function validateStockSymbols(symbols) {

  for (const symbol of symbols) {
    const uri = `https://stock-price-checker-proxy.freecodecamp.rocks/v1/stock/${symbol}/quote`;
    const result = await fetch(uri);

    return await result.json()

  }

}

//getting the IP address
async function getIpHash() {
  const interfaces = os.networkInterfaces();
  for (const interfaceName in interfaces) {
    for (const iface of interfaces[interfaceName]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
}


const handleSingleStock = async (stockSymbol, like, res) => {
  const uri = `https://stock-price-checker-proxy.freecodecamp.rocks/v1/stock/${stockSymbol}/quote`;
  const result = await fetch(uri);
  const stockInfo = await result.json();

  const ipHashed = await getIpHash();

  AddStockToDB(stockSymbol)

  if (like)
    await checkIfTheStockWasLiked(stockSymbol, ipHashed)



  const stockFromDB = await stock.findOne({
    "stock": stockSymbol,
  });

  res.status(200).json({
    "stockData": {
      "stock": stockInfo.symbol,
      "price": stockInfo.latestPrice,
      "likes": stockFromDB ? stockFromDB.likes.length : 0
    }
  })

}

const handleDoubleStock = async (stock1, stock2, like, res) => {

  const ip = await getIpHash();
  //if the stock does not exist in the database Add id
  AddStockToDB(stock1);
  AddStockToDB(stock2);
  checkIfTheStockWasLiked(stock1, ip);
  checkIfTheStockWasLiked(stock2, ip);

  const [stockInfo1, stockInfo2] = await Promise.all([
    fetchStockInfo(stock1),
    fetchStockInfo(stock2)
  ]);

  const stocksFromDB = await stock.find({ "stock": { $in: [stock1, stock2] } });

  res.json({
    "stockData": [
      {
        "stock": stockInfo1.symbol,
        "price": stockInfo1.latestPrice,
        "rel_likes": stocksFromDB.find(s => s.stock === stock1)?.likes.length || 0,
      },
      {
        "stock": stockInfo2.symbol,
        "price": stockInfo2.latestPrice,
        "rel_likes": stocksFromDB.find(s => s.stock === stock2)?.likes.length || 0,
      }
    ]
  })

}


const fetchStockInfo = async (stockSymbol) => {
  const uri = `https://stock-price-checker-proxy.freecodecamp.rocks/v1/stock/${stockSymbol}/quote`;
  const result = await fetch(uri);
  return await result.json();
}


const checkIfTheStockWasLiked = async (stockSymbol, ipHashed) => {

  const _stock = await stock.findOne({ "stock": stockSymbol, });

  var theStockIsAlreadyLiked = false;

  for (let i = 0; i < _stock.likes.length; i++) {
    var compare = await bcrypt.compare(ipHashed, _stock.likes[i]);

    if (compare === true) {
      var theStockIsAlreadyLiked = true;
      break;
    }
  }

  if (!theStockIsAlreadyLiked) {
    const hashingIp = await bcrypt.hash(ipHashed, saltRound);

    await stock.updateOne(
      { "stock": stockSymbol },
      { $addToSet: { "likes": hashingIp } })
  }


}


const AddStockToDB = async (stockSymbol) => {
  const doesStockExist = await stock.findOne({
    "stock": stockSymbol,
  });

  //adding the stock if it does not exist 
  if (doesStockExist === null) {
    //add the stock to the database
    await stock.create({
      "stock": stockSymbol,
      likes: []
    });
  }
}