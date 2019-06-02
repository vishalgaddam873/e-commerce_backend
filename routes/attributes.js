module.exports = function(attributes,knex){
  // Get Attributes list
  attributes.get('/',(request, response, next)=>{
    var query = knex.select('*').from('attribute').then((attributeList)=>{
      console.log('\nAttribute List:\n',attributeList);
      return response.json(attributeList);
    });
  });

  // Get Attribute by id
  attributes.get('/:attribute_id',(request, response, next)=>{
    var attribute_id = request.params.attribute_id;
    var query = knex.select('*').from('attribute').where('attribute_id',attribute_id)
        .then((attribute)=>{
          console.log("\nAttribute by Id:\n",attribute);
          return response.json(attribute[0]);
        });
  });

  // Get values Attributes from attribute
  attributes.get('/values/:attribute_id',(request, response, next)=>{
      var attribute_id = request.params.attribute_id;
      var query = knex.select('attribute_value_id','value').from('attribute_value')
          .join('attribute',function(){
            this.on('attribute_value.attribute_id','=','attribute.attribute_id');
          }).where('attribute.attribute_id',attribute_id).then((attributeValueList)=>{
            console.log("\nAttribute value list:\n",attributeValueList);
            return response.json(attributeValueList);
          });
  });

  // Get all Attributes with Product ID
  attributes.get('/inProduct/:product_id',(request, response, next)=>{
    var product_id = request.params.product_id;
    var query = knex.select(
      'attribute.name as attribute_name',
      'attribute_value.attribute_value_id',
      'value as attribute_value')
        .from('attribute').join('attribute_value',function(){
          this.on('attribute.attribute_id','=','attribute_value.attribute_id');
        }).join('product_attribute',function(){
          this.on('attribute_value.attribute_value_id','=','product_attribute.attribute_value_id');
        }).join('product',function(){
          this.on('product_attribute.product_id','=','product.product_id');
        }).where('product.product_id',product_id).then((attributeList)=>{
          console.log('\nAttribute with product id:\n',attributeList);
          return response.json(attributeList)
        });
  });
};
