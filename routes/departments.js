module.exports = function(departments,knex){
  // get list of all departments
  departments.get('/',(request, response, next)=>{
    var query = knex.select('*').from('department').then((departmentList)=>{
      console.log("\nDepartment List:\n" ,departmentList);
      return response.json(departmentList)
    });
  });

  // get department by id
  departments.get('/:department_id',(request, response, next)=>{
    var department_id = request.params.department_id;
    var query = knex.select('*').from('department').where('department_id',department_id).then((department)=>{
      console.log("\nDepartment:\n" ,department[0]);
      return response.json(department[0]);
    });
  });
};
