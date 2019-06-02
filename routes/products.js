const config = require('../config');

module.exports = function(products,knex,jwt){
  // Get list of all products
  products.get('/',(request, response, next)=>{
    var query = knex.select(
      'product_id',
      'name',
      'description',
      'price',
      'discounted_price',
      'thumbnail'
    ).from('product').then((productList)=>{
      console.log("\nProduct List:\n" ,productList);
      return response.json({count:productList.length, rows:productList})
    });
  });

  // search product  Note do this task at the end
  products.get('/search',(request, response, next)=>{
    var query_string = request.query.query_string;
    console.log(request.query.query_string);
    var query = knex.select('*').from('product')
    .where('name','like','%' + ' ' + query_string)
    .orWhere('name','like', query_string + ' ' + '%')
    .orWhere('description','like','%' + query_string + '%')
    .orWhere('name',query_string)
    .then((product)=>{
      console.log("\nProduct by search product name:\n",product)
      return response.json({count : product.length, rows : product});
    });
  });

  // Get product by id
  products.get('/:product_id',(request, response, next)=>{
    var product_id = request.params.product_id;
    var query = knex.select('*').from('product').where('product_id',product_id)
    .then((product)=>{
      if(product.length == 0){
        var errMsg =  {
                        "error": "Don't exist product with this ID."
                     }
        console.log("\nProduct:\n" ,"Don't exist department with this ID.");
        return response.json(errMsg);
      }
      console.log("\nProduct:\n" ,product[0]);
      return response.json(product[0]);
    });
  });

  // Get list of Products of Categories.
  products.get('/inCategory/:category_id',(request, response, next)=>{
    var category_id = request.params.category_id;
    var query = knex.select(
      'product_category.product_id',
      'name','description',
      'price',
      'discounted_price',
      'thumbnail'
    ) .from('product_category').join('product', function() {
      this.on('product_category.product_id', '=', 'product.product_id');
    }).where('category_id',category_id).then((categoryList)=>{
          console.log("\nProducts of Categories:\n",categoryList);
          return response.json({count:categoryList.length, rows:categoryList})
        })

  })

  // Get list of Products on Department
  products.get('/inDepartment/:department_id',(request, response, next)=>{
    var department_id = request.params.department_id;
    var query = knex.select(
      `product.product_id`,
      `product.name`,
      `product.description`,
      `product.price`,
      `product.discounted_price`,
      `product.thumbnail`,
      `product.display`,
    ).from('product').join('product_category',function(){
      this.on('product.product_id','=','product_category.product_id');
    }).join('category',function(){
      this.on('product_category.category_id','=','category.category_id');
    }).join('department',function(){
      this.on('category.department_id','=','department.department_id');
    }).where('category.department_id',department_id).then((productList)=>{
      console.log('\nList of Products on Department:',productList);
      return response.json({count:productList.length, rows:productList});
    });
  });

  // Get detils of product
  products.get('/:product_id/details',(request, response, next)=>{
    var product_id = request.params.product_id;
    var query = knex.select(
      `product_id`,
      `name`,
      `description`,
      `price`,
      `discounted_price`,
      `image`,
      'image_2 as image2'
    ).from('product').where('product_id',product_id).then((product)=>{
      if(product.length == 0){ return response.json(product)};
      console.log("\nDetails of product:\n",product[0]);
      return response.json(product[0]);
    });
  });

  // Get location of product
  products.get('/:product_id/locations',(request, response, next)=>{
    var product_id = request.params.product_id;
    var query = knex.select(
      'category.category_id',
      'category.name as category_name',
      'department.department_id',
      'department.name as department_name'
    )
    .from('product').join('product_category',function(){
      this.on('product.product_id','=','product_category.product_id');
    }).join('category', function(){
      this.on('product_category.category_id','=','category.category_id');
    }).join('department',function(){
      this.on('category.department_id','=','department.department_id');
    }).where('product.product_id',product_id).then((productDetails)=>{
      console.log("\nLocation of product:\n",productDetails[0]);
      return response.json(productDetails[0]);
    });
  });

  //Rivew to the product by customer
  // NOTE: To run this endpoint have to create customer first
  products.post('/:product_id/reviews',(request, response, next)=>{
    //Example for request body
    //Ensure the product id in requet params and in body is same
    `{
      	"product_id" : 3,
      	"review" : "Best",
      	"rating" : 3
    }`
    var product_id = request.params.product_id;
    var content = request.body;
    var token = request.headers['authorization'].split(' ')[1];
    jwt.verify(token,config.secret,(err,customerData)=>{
      var customer = {
        email:customerData.customer.email,
        password : customerData.customer.password
      };
      var query = knex.select('*').from('customer')
      .where(customer).then((customerDetail)=>{
        var today = new Date();
        content['customer_id'] = customerDetail[0].customer_id;
        content['created_on'] = today;
        var insertQuery = knex('review').insert(content).then(()=>{
          console.log("Sucessfully review add");
          return response.json({message:"Review is added Sucessfully"});
        });
      });
    });
  });

  //Get reviews of the product
  // NOTE: To run this endpoint have to create customer first
  products.get('/:product_id/reviews',(request, response, next)=>{
    var product_id = request.params.product_id;
    var token = request.headers['authorization'].split(' ')[1];
    jwt.verify(token,config.secret,(err,customerData)=>{
      var customer = {
        email:customerData.customer.email,
        password : customerData.customer.password
      };
      var query = knex.select(
        'customer.name',
        'review',
        'rating',
        'created_on'
      ).from("review").join('customer','review.customer_id','=','customer.customer_id')
      .where(customer).then((reviewDetail)=>{
        console.log("\nReview details of customer:\n",reviewDetail);
        return response.json(reviewDetail);
      });
    });
  });
};
