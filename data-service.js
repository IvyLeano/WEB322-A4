var employees = {};
var departments = {};

module.exports.initialize = function() {
    return new Promise(function(resolve, reject){
        const fs = require('fs');
        fs.readFile('./data/employees.json', (err, data) => {
            if(err) reject("unable to read data");
            employees = JSON.parse(data);
        })
        fs.readFile('./data/departments.json', (err,data) => {
            if(err) reject("unable to read data");
            departments = JSON.parse(data);
            resolve();
        })
    })
}

module.exports.getAllEmployees = function() {
    return new Promise(function(resolve, reject){
        if(employees == 0) { reject("no results"); }
        else { resolve(employees); }
    })
}

module.exports.addEmployee = function(employeeData) { 
    return new Promise(function(resolve, reject){     
        if(employeeData.isManager == undefined) { employeeData.isManager = false; }
        else { employeeData.isManager = true;}
        employeeData.employeeNum = (employees.length + 1);
        employees.push(employeeData);
        resolve();
    })
}

module.exports.getManagers = function() {
    return new Promise(function(resolve, reject){
       var managers = employees.filter(function(x){
           return x.isManager == true;
       })
        if(managers == 0){ reject("no results returned"); }
        else {resolve(managers);}
    })
}

module.exports.getDepartments = function() {
    return new Promise(function(resolve, reject){
        if(departments == 0) { reject("no results returned"); }
        else {  resolve(departments); }
    })
}

module.exports.getEmployeesByStatus = function(stat){
       return new Promise(function(resolve, reject){
        var status = employees.filter(function(x){
             var y = stat.replace(/"/g,"");
             return x.status == y;     
        })
        if(status == 0) { reject("no results returned"); }
        else {  resolve(status); }
     })
}

module.exports.getEmployeesByManager = function(manager){
    return new Promise(function(resolve, reject){
        var mang = employees.filter(function(x){
            if(x.employeeManagerNum == manager) {
            var department = x.departmentNum;
            return x.departmentNum == department;
            }
        })
         if(mang == 0){ reject("no results returned"); }
         else {resolve(mang);}
     })
    }

module.exports.getEmployeesByDepartment = function(departmentnum){
    return new Promise(function(resolve, reject){
        var dept = employees.filter(function(x){
            return x.department == departmentnum;
        })
         if(dept == 0){ reject("no results returned"); }
         else {resolve(dept);}
     })
 }

 module.exports.getEmployeeByNum = function(num){
    return new Promise(function(resolve, reject){
        var number = employees.filter(function(x){
            return x.employeeNum == num;
        })
         if(number == 0){ reject("no results returned"); }
         else {resolve(number);}
     })
 }

 module.exports.updateEmployee = function(employeeData){
     return new Promise (function(resolve, reject){
         var match = false;
            for(var i = 0; i < employees.length; i++){
                if(employees[i].employeeNum == employeeData.employeeNum){
                    employees[i] = employeeData;
                    match = true;
                    resolve();}
            }
            if(match == false){ reject("no matches found"); }
    })
 }