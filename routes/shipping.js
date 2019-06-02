module.exports = function(shipping,knex){
  //Return shipping regions from shipping_region table
  shipping.get('/regions',(request, response, next)=>{
    var query = knex.select('*').from('shipping_region').then((shippingData)=>{
      console.log('\nShipping region data:\n',shippingData);
      return response.json(shippingData);
    });
  });

  //Return shipping regions from shipping table
  // Always select shipping_region_id between 2 to 4 
  shipping.get('/regions/:shipping_region_id',(request, response, next)=>{
    var shipping_region_id = request.params.shipping_region_id;
    var query = knex.select('*').from('shipping').where('shipping_region_id',shipping_region_id)
    .then((shippingData)=>{
      console.log('\nShipping region data:\n',shippingData);
      return response.json(shippingData);
    })
  });
}
