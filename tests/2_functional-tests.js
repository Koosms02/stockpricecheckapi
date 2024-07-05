const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');
const stock = require('../models/stock');

chai.use(chaiHttp);

suite('Functional Tests', function () {
    //view one stock
    test('viewing one stock: GET /api/stock-prices', function (done) {
        chai.request(server).keepOpen().get('/api/stock-prices')
            .query({ stock: 'GOOG' })
            .end((err, res) => {

                assert.equal(res.status, 200);
                assert.equal(res.body.stockData.stock, 'GOOG');
                assert.exists(res.body.stockData.price, 'Price exist')
                done();
            })

    })

    //view one stock and like it

    test("viewing one stock and liking it: GET /api/stock-prices", function (done) {
        chai.request(server)
            .keepOpen()
            .get('/api/stock-prices')
            .query({ stock: "GOOG", like: true })
            .end((err, res) => {
                assert.equal(res.status, 200);
                assert.equal(res.body.stockData.stock, 'GOOG');
                assert.equal(res.body.stockData.likes, 2);
                assert.exists(res.body.stockData.price, 'Price exists')
                done();
            })
    })


    test('Viewing the same stock and liking it again: GET request to /api/stock-prices/', (done) => {
        chai.request(server)
            .keepOpen()
            .get('/api/stock-prices')
            .query({ stock: 'GOOG', like: true })
            .end((err, res) => {
                assert.equal(res.status, 200);
                assert.equal(res.body.stockData.stock, 'GOOG');
                assert.equal(res.body.stockData.likes, 2);
                assert.exists(res.body.stockData.price, 'Price exists')
                done();
            });
    });


    test('Viewing two stocks: GET request to /api/stock-prices/', (done) => {
        chai.request(server)
            .keepOpen()
            .get('/api/stock-prices')
            .query({ stock: ['GOOG', 'AAPL'] })
            .end((err, res) => {
                assert.equal(res.status, 200);
                assert.equal(res.body.stockData[0].stock, 'GOOG');
                assert.equal(res.body.stockData[1].stock, 'AAPL');
                done();
            });
    });

    test('Viewing two stocks and liking them: GET request to /api/stock-prices/', (done) => {
        chai.request(server)
            .keepOpen()
            .get('/api/stock-prices')
            .query({ stock: ['GOOG', 'AAPL'], like: true })
            .end((err, res) => {
                assert.equal(res.status, 200);
                assert.equal(res.body.stockData[0].stock, 'GOOG');
                assert.equal(res.body.stockData[1].stock, 'AAPL');
                assert.equal(res.body.stockData[0].rel_likes, 2);
                assert.equal(res.body.stockData[1].rel_likes, 1);
                done();
            });
    });

});
