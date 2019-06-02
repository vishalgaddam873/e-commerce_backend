module.exports = function(categories,knex){
  // Get list of all categories
  categories.get('/',(request, response, next)=>{
    var query = knex.select('*').from('category').then((categoryList)=>{
      console.log("\nCategories:\n" ,categoryList);
      return response.json({count:categoryList.length, rows:categoryList})
    });
  });

  // Get category by id
  categories.get('/:category_id',(request, response, next)=>{
    var category_id = request.params.category_id;
    var query = knex.select('*').from('category').where('category_id',category_id).then((category)=>{
      if(category.length == 0){
        var errMsg = {
                        "error": "Don't exist product with this ID."
                     }
        console.log("\nCategory:\n" ,"Don't exist category with this ID.");
        return response.json(errMsg);
      }
      console.log("\nCategory:\n" ,category[0]);
      return response.json(category[0]);
    });
  });

  // Get categories of product
  categories.get('/inProduct/:product_id',(request, response, next)=>{
      var product_id = request.params.product_id;
      var query = knex.select('category.category_id','category.department_id','category.name')
      .from('category').join('product_category',function(){
        this.on('category.category_id','=','product_category.category_id');
      }).join('product',function(){
        this.on('product.product_id','=','product_category.product_id');
      }).where('product.product_id',product_id).then((categoryList)=>{
        console.log('\nCategory of product:\n',categoryList);
        return response.json(categoryList)
      })
  })

  // Get category in department by department id
  categories.get('/inDepartment/:department_id',(request, response, next)=>{
    var department_id = request.params.department_id;
    var query = knex.select('*').from('category').where('department_id',department_id).then((category)=>{
      console.log("\nCategory by department:\n",category);
      return response.json(category);
    });
  });
};
