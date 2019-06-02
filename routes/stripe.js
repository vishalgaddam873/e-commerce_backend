module.exports = function(stripe_ep, Stripe){
  //Stripe is the current standard for developers accepting payments in the US.

  // NOTE: Before charge endpoint, run token endpoint to get card token
  // Enddpoint gives stripe card token without front-end
  stripe_ep.get('/token',(request, response, next)=>{
    var stripe = Stripe(process.env.STRIPE_PUBLISH_KEY);
    stripe.tokens.create({
       card: {
         number: '4242424242424242',
         exp_month: 12,
         exp_year: 2020,
         cvc: '123'
       }
     }, function(err, token) {
       // asynchronously called
       console.log(token);
       response.json({token:token.id})
     });
   });

  //This method recived front-end payment and create change
  stripe_ep.post('/charge',(request, response, next)=>{
    //Example of request body
    `{
    	"token": "Stripe token paste here..",
    	"order_id" : 65,
    	"description" : "T-shirt",
    	"amount" : 100,
    	"currency" : "usd"
    }`
    const stripeToken = request.body.token;
    var stripe = Stripe(process.env.STRIPE_SECRETE_KEY);
    stripe.charges.create({
    amount: request.body.amount,
    currency: request.body.currency,
    description: request.body.description,
    source: stripeToken
    },function(err, charge){
      console.log(err);
      if(err){
        return response.json(
          {
            sucess:false,
            message : "Payment is failed"
          });
      }else{
        return response.json(charge)
      };
    });
  });

  //Endpoint that provide a synchronization
  // NOTE: Before runing this endpoint download ngrok and follow the steps on website
  // Also run local server with ngrok don't stop or close it 
  stripe_ep.post('/webhooks',(request, response, next)=>{
    var stripe = Stripe(process.env.STRIPE_SECRETE_KEY);

      const endpoint = stripe.webhookEndpoints.create({
      // Change url with your ngork url
      url: "https://54ef2899.ngrok.io/stripe/webhooks",
      enabled_events: ["charge.failed", "charge.succeeded"]
    }, function(err, webhookEndpoint) {
      // asynchronously called
      if(err){
        return response.json({recived:false});
      }else{
        console.log("\nWe get secrete key\n",webhookEndpoint);
        return response.json({recived:true})
      };
    });
  });

};
