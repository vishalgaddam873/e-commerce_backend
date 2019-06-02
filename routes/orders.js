module.exports = function (orders,knex){
  // NOTE: First run all shopping cart endpoints
  //Create orders
  orders.post('/',(request, response, next)=>{

    //Example for request body
    `{
    	"cart_id" : "2slkvmfw9ww",
    	"product_id" : 1,
    	"customer_id" : 1,
    	"shipping_id" : 3,
    	"tax_id" : 1
    }`

    var hasTable = knex.schema.hasTable('order_placed').then((exists)=>{
      if(!exists){
        return knex.schema.createTable('order_placed',(table)=>{
          table.integer('order_id');
          table.string('cart_id');
          table.integer('customer_id');
          table.integer('product_id');
          placeOrder();
        });
      }else{
        placeOrder()
      }
      //Place order for any product
      function placeOrder(){
        var cart_id = request.body.cart_id;
        var product_id = request.body.product_id;
        var customer_id = request.body.customer_id;
        var shipping_id = request.body.shipping_id;
        var tax_id = request.body.tax_id;
        var createOrder = knex('orders').insert({
          customer_id : customer_id,
          tax_id : tax_id,
          shipping_id : shipping_id,
          created_on : new Date()
        }).then(()=>{
          var selectQuery = knex.select('order_id').from('orders')
          .then((order_id)=>{
            var orderId = order_id[order_id.length -1];
            var orderDetail = {
              order_id : orderId.order_id,
              cart_id : cart_id,
              customer_id : customer_id,
              product_id : product_id
            };
            var orderPlacedQuery = knex('order_placed').insert(orderDetail)
            .then(()=>{
                var selectQuery = knex.select(
                  'shopping_cart.product_id',
                  'price',
                  'quantity',
                  'shipping_cost',
                  'tax_percentage'
                )
                .from('shopping_cart')
                .join('product','shopping_cart.product_id','=','product.product_id')
                  .join('shipping','shipping.shipping_id','=',shipping_id)
                .join('tax','tax.tax_id','=',tax_id).where({
                  cart_id : cart_id,
                  'shopping_cart.product_id' : product_id
                })
                .then((total)=>{
                  var totalAmount = (total[0].price + total[0].shipping_cost + total[0].tax_percentage / 100 )* total[0].quantity
                  var totalInsert = knex('orders').where(orderId).update({total_amount:totalAmount}).then(()=>{
                    console.log("\nOrder Price Details:\n",total[0]);
                    return response.json(orderId)
                  });
                });
            });
          });
        });
      };
    });
  });

  //Get info about order
  orders.get('/:order_id',(request, response, next)=>{
    var order_id = request.params.order_id;
    var query = knex.select(
      'order_placed.order_id',
      'shopping_cart.product_id',
      'product.name as product_name',
      'attributes',
      'quantity',
      'price as unit_cost'
    ).from('order_placed')
    .join('shopping_cart',{'order_placed.cart_id':'shopping_cart.cart_id',
    'order_placed.product_id' : 'shopping_cart.product_id'
  })
    .join('product','order_placed.product_id','=','product.product_id').where('order_id',order_id)
    .then((oderDetails)=>{
      console.log(oderDetails);
      oderDetails[0]['subtotal'] = oderDetails[0].unit_cost * oderDetails[0].quantity;
      console.log("\nOder details by oder id:\n", oderDetails[0]);
      return response.json(oderDetails[0]);
    });
  });

  //Get orders by customer
  orders.get('/inCustomer/:customer_id',(request, response, next)=>{
    var customer_id = request.params.customer_id;
    var query = knex.select(
      'order_placed.order_id',
      'order_placed.product_id',
      'product.name as product_name',
      'shopping_cart.attributes',
      'shopping_cart.quantity',
      'product.price as unit_cost'
    ).from('order_placed')
    .join('shopping_cart',
      {
      'order_placed.cart_id':'shopping_cart.cart_id',
      'order_placed.product_id':'shopping_cart.product_id'
      })
    .join('product','order_placed.product_id','=','product.product_id')
    .where('customer_id',customer_id)
    .then((orders)=>{
      orders.forEach((order)=>{
        order['subtotal'] = order.unit_cost * order.quantity;
        console.log("\nAll orders by customer:\n",orders);
        return response.json(orders);
      });
    });
  });

  //Get info about order
  orders.get('/shortDetail/:order_id',(request, response, next)=>{
    var order_id = request.params.order_id;
    var query = knex.select(
      'orders.order_id',
      'total_amount',
      'created_on',
      'shipped_on',
      'status',
      'product.name'
    )
    .from('orders')
    .join('order_placed','orders.order_id','=','order_placed.order_id')
    .join('product','order_placed.product_id','product.product_id')
    .where('orders.order_id',order_id)
    .then((shortDetails)=>{
      console.log("\nShort details about order:\n",shortDetails[0]);
      return response.json(shortDetails[0]);
    })
  });
};
