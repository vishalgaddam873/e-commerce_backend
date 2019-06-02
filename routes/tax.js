module.exports = function(tax,knex){
  //Get all Taxes
  tax.get('/',(request, response, next)=>{
    var query = knex.select('*').from('tax').then((taxList)=>{
      console.log('\nAll tax list:\n',taxList);
      return response.json(taxList);
    });
  });

  //Get Tax by ID
  tax.get('/:tax_id',(request, response, next)=>{
    var tax_id = request.params.tax_id;
    var query = knex.select('*').from('tax').where('tax_id',tax_id)
        .then((tax)=>{
          console.log('\nTax info:\n',tax[0]);
          return response.json(tax[0]);
        });
  });
};
