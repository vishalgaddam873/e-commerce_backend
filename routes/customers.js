
const config = require('../config');
// var express = require('express');
// var app = express();
// var _customer = express.Router();
// app.use('/customer',_customer);
module.exports = function(customers,_customer,knex,jwt){
  // Register a customer
  customers.post('/',(request, response, next)=>{
      //Example of request body
      `{
          "name" : "< customer name >"
  	      "email" : "customer@example.com",
  	      "password" : "password"
      }`
      var customer = {
        email : request.body.email,
        password : request.body.password
      }
      var insertQuery = knex('customer').insert(request.body).then(()=>{
        var query = knex.select('*').from('customer').where(customer)
        .then((customersDetail)=>{
          jwt.sign({
            customer
          },config.secret,{expiresIn:config.expires_in},(err,token)=>{

            console.log('\nCoustomer Details:',customersDetail[0]);
            return response.json({
              customer : {
                schema : customersDetail[0]
              },
              accessToken :  "Bearer "+ token,
              expires_in : config.expires_in
            });
          });
        });
      })
  });

  // Token verification
  function verifyToken(request, response, next){
    const bearerHeader = request.headers['authorization'];
    if(typeof bearerHeader != 'undefined'){
      var bearerToken = bearerHeader.split(' ')[1];
      request.token = bearerToken;
      next();
    }else{
      return response.sendStatus(403);
    };
  };

  // Log In in the shopping
  customers.post('/login',verifyToken,(request, response, next)=>{
    //Example of request body
    `{
	      "email" : "customer@example.com",
	      "password" : "password"
    }`
    var email = request.body.email;
    var password = request.body.password;
    var customer = {
      email : email,
      password: password
    }
    var query = knex('customer').where(customer).select("*").then((customerDetail)=>{
      jwt.verify(request.token, config.secret, (err, customerData)=>{
        if(err){
          // return response.sendStatus(403);
          const refreshToken = jwt.sign({customer
          },config.secret,{expiresIn:config.expires_in},(err,token)=>{
            request.token = token;
            console.log("token",token);
            return response.json({newToken:token});
          });
        };
        if(customerData.customer.email == email && customerData.customer.password == password){
          console.log('\nCoustomer Details:',customerDetail[0]);
          return response.json({
            customer : {
              schema : customerDetail[0]
            },
            accessToken :  "Bearer "+ request.token,
            expires_in : config.expires_in
          });
        }else{
          return response.json({
            errorMsg :"Invalid user or Invalid Token"
          });
        };
      });
    });
  });

  //Get customer by ID. The customer is getting by Token
  // Put the customer access token in postman headers to get customer
  _customer.get('/',(request,response,next)=>{
    var token = request.headers['authorization'].split(' ')[1];
    jwt.verify(token,config.secret,(err, customerData)=>{
      var customer = {
        email : customerData.customer.email,
        password : customerData.customer.password
      };
      var query = knex.select('*').from('customer').where(customer).then((customerDetail)=>{
        console.log("\nCustomer by Id and token:\n",customerDetail[0]);
        return response.json(customerDetail[0]);
      });
    });
  });

  // Update customer
  _customer.put('/',(request,response,next)=>{
    //Example for request body
    `{
      "name": "Vishal Gaddam",
      "email": "vishal18@navgurukul.org",
      "password": "password",
      "day_phone": "9989656757",
      "eve_phone": "7022345481",
      "mob_phone": "9856741235"
    }`
    var updated_customer = request.body
    var token = request.headers['authorization'].split(' ')[1];
    jwt.verify(token,config.secret,(err, customerData)=>{
      var customer = {
        email : customerData.customer.email,
        password : customerData.customer.password
      };
      var updateQuery = knex('customer').where(customer).update(updated_customer).then(()=>{
        var query  = knex.select('*').from('customer').where(customer).then((customerDetail)=>{
          console.log("\nUpdated customer:\n",customerDetail[0]);
          return response.json(customerDetail[0]);
        });
      });
    });
  });

  // Update address from the customer
  customers.put('/address',(request,response,next)=>{
    //Example for request body
    `{
      "address_1": "Mumbai",
      "address_2": "Sion Mumbai",
      "city": "Mumbai",
      "region": "Sion Mumbai",
      "postal_code": "400022",
      "country": "India",
      "shipping_region_id": 1
    }`
    var updated_customer = request.body
    var token = request.headers['authorization'].split(' ')[1];
    jwt.verify(token,config.secret,(err, customerData)=>{
      var customer = {
        email : customerData.customer.email,
        password : customerData.customer.password
      };
      var updateQuery = knex('customer').where(customer).update(updated_customer).then(()=>{
        var query  = knex.select('*').from('customer').where(customer).then((customerDetail)=>{
          console.log("\nUpdated customer:\n",customerDetail[0]);
          return response.json(customerDetail[0]);
        });
      });
    });
  });

  //Update the credit card from customer
  customers.put('/creditCard',(request,response,next)=>{
    //Example for request body
    `{
      "credit_card": "XXXXXXXX5100"
    }`
    var updated_customer = request.body
    var token = request.headers['authorization'].split(' ')[1];
    jwt.verify(token,config.secret,(err, customerData)=>{
      var customer = {
        email : customerData.customer.email,
        password : customerData.customer.password
      };
      var updateQuery = knex('customer').where(customer).update(updated_customer).then(()=>{
        var query  = knex.select('*').from('customer').where(customer).then((customerDetail)=>{
          console.log("\nUpdated customer:\n",customerDetail[0]);
          return response.json(customerDetail[0]);
        });
      });
    });
  });
};
