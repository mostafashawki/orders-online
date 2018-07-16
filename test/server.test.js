const mongoose = require("mongoose");

//if you want to use the test db
//process.env.NODE_ENV = 'test';

//Require the dev-dependencies
let chai = require('chai');
let chaiHttp = require('chai-http');
let server = require('../server');
let should = chai.should();

var expect = chai.expect;

chai.use(chaiHttp);


//Test /orders/create route, and test validations if it works properly
  describe('/POST /customers/create', () => {


    it('Should get new customer', (done) => {
        chai.request(server)
          .post('/customers/create')
          .send({'email': 'johndoe@gmail.com', 
                 'name': 'John Doe',
                 'address': 'Test address',
                 'currency': 'EUR'
                 
                })
          .end((err, res) => {
            res.should.have.status(200);
            //before test go to the route and uncommenct res.json(customer)
            res.should.be.json;
            res.body.should.have.property('email');
            res.body.should.have.property('name');
            res.body.should.have.property('address');
            res.body.should.have.property('currency');
            done();
          });
      });
  });


  // Test /orders/create route, and test validations if it works properly
  describe('/POST   /orders/create', () => {


    it('Should get new order', (done) => {
        chai.request(server)
          .post('/orders/create')
          
          //////////////////////
          .send({
            "customer": "QLIN0QzvB",
            "currency": "EUR",
            "items": '[{"item": "3cd5ytr","qty": 1,"tPrice": 500},{"item": "3eds34f","qty": 2,"tPrice": 40}]'
          })
          .end((err, res) => {
            res.should.have.status(200);
            //before test go to the route and uncommenct res.json(order)
            res.should.be.json;
            res.body.should.have.property('currency');
            res.body.should.have.property('customer');
            res.body.should.have.property('items');
            res.body.should.have.property('urlId');
            done();
          });
      });
  });

