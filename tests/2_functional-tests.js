const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');
const stock = require('../models/stock');

chai.use(chaiHttp);

suite('Functional Tests', function () {
    let stock;
    //view one stock
    test('viewing one stock: GET /api/stock-prices', () => {
        chai.request(server)
            .get('/api/stock-prices')
            .query({ stock: 'GOOG' })
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a('object');
                res.body.should.have.property('stockData');
                res.body.should.have.property('stock').eql('GOOG');
                stock = res.body.stockData;
                done();
            })

    })

    //view one stock and like it

    test("viewing one stock and liking it: GET /api/stock-prices", (done) => {
        chai.request(server)
            .get('/api/stock-prices')
            .query({ stock: "GOOG", like: true })
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a('object');
                res.body.should.have.property('stockData');
                res.body.should.have.property('stock').eql('GOOG');
                res.body.should.have.property('likes').eql('stock.likes');
                stock = res.body.stockData;
                done();
            })
    })


    test('Viewing the same stock and liking it again: GET request to /api/stock-prices/', (done) => {
        chai.request(server)
            .get('/api/stock-prices')
            .query({ stock: 'GOOG', like: true })
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a('object');
                res.body.should.have.property('stockData');
                res.body.stockData.should.have.property('stock').eql('GOOG');
                res.body.stockData.should.have.property('likes').eql(stock.likes); // Likes shouldn't increase
                done();
            });
    });


    test('Viewing two stocks: GET request to /api/stock-prices/', (done) => {
        chai.request(server)
            .get('/api/stock-prices')
            .query({ stock: ['GOOG', 'AAPL'] })
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a('object');
                res.body.should.have.property('stockData').which.is.an('array');
                res.body.stockData.length.should.be.eql(2);
                res.body.stockData[0].should.have.property('stock').eql('GOOG');
                res.body.stockData[1].should.have.property('stock').eql('AAPL');
                done();
            });
    });

    test('Viewing two stocks and liking them: GET request to /api/stock-prices/', (done) => {
        chai.request(server)
            .get('/api/stock-prices')
            .query({ stock: ['GOOG', 'AAPL'], like: true })
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a('object');
                res.body.should.have.property('stockData').which.is.an('array');
                res.body.stockData.length.should.be.eql(2);
                res.body.stockData[0].should.have.property('stock').eql('GOOG');
                res.body.stockData[0].should.have.property('likes').above(stock.likes);
                res.body.stockData[1].should.have.property('stock').eql('AAPL');
                done();
            });
    });

});
