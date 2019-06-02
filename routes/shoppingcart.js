module.exports = function (shoppingcart,knex){
  // NOTE: Before creating any new cart first generate unique cart id

  //Generate the unique cart id
  shoppingcart.get('/generateUniqueId',(request, response, next)=>{
    var uniqueId = generate_unique_id()
    var query = knex.select('cart_id').from('shopping_cart')
    .where('cart_id',uniqueId).then((cart)=>{
      if(cart.length == 0){
        return response.json({cart_id:uniqueId})
      }else{
        return response.json({
          message :"Cart id is already exists please again generate unique id"
        });
      };
    });
  });

  // unique id generator
  function generate_unique_id(){
    var characters = "abcdefghijklmnopqrstuvwxyz0123456789";
    var uniqueId = '';
    var charactersLength = characters.length;
    for ( var i = 0; i < 11; i++ ) {
      uniqueId += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return uniqueId;
  }

  // Add product in cart
  // NOTE: Before creating any new cart first generate unique cart id
  shoppingcart.post('/add',(request, response, next)=>{
      //Example for request body
      `{
          "cart_id": "< customer cart id generated by above get method >",
          "product_id" : 1,
          "attributes" : "S",
          "quantity" : 2
      }`
      var shoppingCart_details = request.body;
      shoppingCart_details['added_on'] = new Date();
      var insertQuery = knex('shopping_cart').insert(shoppingCart_details).then(()=>{
        var query = knex.select(
          'item_id',
          'product.name',
          'attributes',
          'product.product_id',
          'product.image',
          'product.price',
          'quantity'
        ).from('shopping_cart').join('product','shopping_cart.product_id','=','product.product_id')
        .where('cart_id',request.body.cart_id)
        .then((shoppingCart)=>{
          for(let cart of shoppingCart){
            cart['subtotal'] = Number(cart.price)* Number(cart.quantity)
          };
          console.log("\nShopping Cart Details:\n",shoppingCart);
          return response.json(shoppingCart);
        });
      });
  });


  //Get list of products in shopping cart
  shoppingcart.get('/:cart_id',(request, response, next)=>{
    var cart_id = request.params.cart_id;
    var query = knex.select(
      'item_id',
      'product.name',
      'attributes',
      'product.product_id',
      'product.image',
      'product.price',
      'quantity'
    ).from('shopping_cart').join('product','shopping_cart.product_id','=','product.product_id')
    .where('cart_id',cart_id)
    .then((shoppingCart)=>{
      console.log("\nProducts in shopping cart:\n",shoppingCart);
      return response.json(shoppingCart);
    })
  });

  //Update cart by item
  shoppingcart.put('/update/:item_id',(request, response, next)=>{
      //Example for request body
      `{
      	 "attributes" : "L",
         "quantity" : 2
       }`
      var item_id = request.params.item_id;
      var shoppingCart_details = request.body;
      var updateQuery = knex('shopping_cart').update(shoppingCart_details).where('item_id',item_id).then(()=>{
        var query = knex.select(
          'item_id',
          'product.name',
          'attributes',
          'shopping_cart.product_id',
          'price',
          'quantity'
        ).from('shopping_cart').join('product','shopping_cart.product_id','=','product.product_id').where('item_id',item_id)
        .then((shoppingCart)=>{
          for(let cart of shoppingCart){
            cart['subtotal'] = Number(cart.price)* Number(cart.quantity);
          };
          console.log("\nShopping Cart Updated Details:\n",shoppingCart);
          return response.json(shoppingCart);
        })
      });
  });

  //Empty cart
  shoppingcart.delete('/empty/:cart_id',(request, response, next)=>{
    var cart_id = request.params.cart_id;
    var deleteQuery = knex('shopping_cart').where('cart_id',cart_id).del().then(()=>{
      var query = knex.select('*').from('shopping_cart').then((emptyCart)=>{
        console.log("\nEmpty cart after Delete:\n",emptyCart);
        return response.json(emptyCart);
      });
    });
  });


  //Ruturn total ammount of cart
  shoppingcart.get('/totalAmmount/:cart_id',(request, response, next)=>{
    var cart_id = request.params.cart_id;
    var query = knex.select('product.price')
    .from('shopping_cart').join('product','shopping_cart.product_id','=','product.product_id')
    .where('cart_id',cart_id).then((priceList)=>{
      var totalAmmount = 0;
      for(let price of priceList){
        totalAmmount += price.price
      };
      console.log("\nTotal ammount of cart:\n",totalAmmount);
      return response.json({totalAmmount:totalAmmount});
    });
  });

  // Save Product for later in items_save table
  shoppingcart.get('/saveForLater/:item_id',(request, response, next)=>{
    var item_id = request.params.item_id;
    var has_table = knex.schema.hasTable('save_items').then((exists)=>{
      if(!exists){
        return knex.schema.createTable('save_items',function(table){
          table.integer('item_id').primary();
          table.string('cart_id');
          table.integer('product_id');
          table.string('attributes');
          table.string('quantity');
          table.boolean('item_save').default(1);

          // item going to save
          var query = knex.select(
          'item_id',
          'cart_id',
          'product_id',
          'attributes',
          'quantity').from('shopping_cart')
          .where('item_id',item_id).then((itemDetails)=>{
            var insertQuery = knex('save_items').insert(itemDetails[0]).then(()=>{
              var removeQuery = knex('shopping_cart').where('item_id',item_id)
              .del().then(()=>{
                response.json({message:"Sucessfully saved for later"});
              });
            });
          });
        });
      }else{
          var query = knex.select('item_id').from('shopping_cart')
          .where('item_id',item_id).then((id)=>{
          var insertQuery = knex('save_items').insert(id[0]).then(()=>{
            var removeQuery = knex('shopping_cart').where('item_id',item_id)
            .del().then(()=>{
              response.json({message:"Sucessfully saved for later"});
            });
          });
        });
      };
    });
  });

  // Get product save for later
  shoppingcart.get('/getSaved/:cart_id',(request, response, next)=>{
      var cart_id = request.params.cart_id;
      var query = knex.select('*').from('save_items')
      .where('cart_id',cart_id)
      .then((savedItem)=>{
        console.log("\nGet save items:\n",savedItem[0]);
        return response.json(savedItem[0]);
      })
  });

  //Move item to shopping cart
  shoppingcart.get('/moveToCart/:item_id',(request, response, next)=>{
    var item_id = request.params.item_id;
    var query = knex.select(
      'item_id',
      'cart_id',
      'product_id',
      'attributes',
      'quantity').from('save_items').where('item_id',item_id).then((saveItem)=>{
        saveItem[0]['added_on'] = new Date();
        var moveQuery = knex('shopping_cart').insert(saveItem[0]).then(()=>{
          var removeQuery = knex('save_items').where('item_id',item_id)
          .del().then(()=>{
            return response.json({message:"Item moved to cart Sucessfully"})
          })
        });
      });
  });

  //Remove product in the cart
  shoppingcart.delete('/removeProduct/:item_id',(request, response, next)=>{
    var item_id = request.params.item_id;
    var removeQuery = knex('shopping_cart').where('item_id',item_id).del()
    .then(()=>{
      return response.json({"message":"Item removed Sucessfully"});
    });
  });

};
