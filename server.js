var dataService = require("./data-service");
var express = require("express");
var multer = require("multer");
var app = express();
var path = require("path");
var fs = require("fs");
var bodyParser = require("body-parser");
var exphbs = require("express-handlebars");

var HTTP_PORT = process.env.PORT || 8080;

// call this function after the http server starts listening for requests
function onHttpStart() {
  console.log("Express http server listening on: " + HTTP_PORT);
}

//define storage variable using multer.diskStorage
const storage = multer.diskStorage({
   destination: "./public/images/uploaded",
   filename: function (req, file, cb) {
     cb(null, Date.now() + path.extname(file.originalname));
   }
 });

 //define upload variable as multer({storage:storage});
 const upload = multer({ storage: storage });

 // add bodyParser middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

app.engine('.hbs', exphbs({ 
   extname: '.hbs', 
   defaultLayout: 'main',
   helpers: {
      navLink: function(url, options){
         return '<li' +
         ((url == app.locals.activeRoute) ? ' class="active" ' : '') +
         '><a href="' + url + '">' + options.fn(this) + '</a></li>';
         },
      equal: function (lvalue, rvalue, options) {
         if (arguments.length < 3)
            throw new Error("Handlebars Helper equal needs 2 parameters");
         if (lvalue != rvalue) {
            return options.inverse(this);
         } else {
            return options.fn(this);
         }
            }
   } 
}));

app.set('view engine', '.hbs');

app.use(function(req,res,next){
   let route = req.baseUrl + req.path;
   app.locals.activeRoute = (route == "/") ? "/" : route.replace(/\/$/, "");
   next();
   });

// setup a 'route' to listen on the default url path (http://localhost)
app.get('/', function (req, res) {
   res.render('home');
});

// setup another route to listen on /about
app.get("/about", function(req,res){
   //res.sendFile(path.join(__dirname, "/views/about.html"));
   res.render('about');
});

// setup another route to listen on /employees
app.get("/employees", function(req,res){
   //Three filters added
   if(req.query.status){
      dataService.getEmployeesByStatus(req.query.status).then((data) => {
         //res.json(data);
         res.render("employees",{employees: data})
      }).catch((err) => res.render({message: err}))  
   }
   else if(req.query.department){
      dataService.getEmployeesByDepartment(req.query.department).then((data) => {
         //res.json(data);
         res.render("employees",{employees: data})
      }).catch((err) => res.render({message: err})) 
   }
   else if(req.query.manager){
      dataService.getEmployeesByManager(req.query.manager).then((data) => {
         //res.json(data);
         res.render("employees",{employees: data})
      }).catch((err) => res.render({message: err}))  
   }
   else {
   dataService.getAllEmployees().then((data) => {
      //res.json(data);
      res.render("employees",{employees: data})
   }).catch((err) => res.render({message: err}))
}
});
// setup another route to listen on /employee/value
app.get('/employee/:value', function(req, res, next) {
   var value = req.params.value;
   dataService.getEmployeeByNum(value).then((data) => {
      //res.json(data);
      res.render("employee", {employee: data[0]});
   }).catch((err) => res.render("employee",{message: err}));
 });
 
// setup another route to listen on /departments
app.get("/departments", function(req,res){
   dataService.getDepartments().then((data) => {
      //res.json(data);
      res.render("departments", {departments: data});
   }).catch((err) => console.log(err))
});

// setup another route to listen on /employees/add
app.get("/employees/add", function(req,res){
  // res.sendFile(path.join(__dirname,"/views/addEmployee.html"));
  res.render('addEmployee');
});

// setup post route for POST/employees/add
app.post('/employees/add', upload.array(), function (req, res, next) {
   var employeeData = req.body;
  dataService.addEmployee(employeeData).then(() => {
      res.redirect("/employees");
   })
 });

//add the POST route: /employee/update
app.post("/employee/update", (req, res) => {
   dataService.updateEmployee(req.body).then(() => {
      res.redirect("/employees");
   }).catch((err) => console.log(err))
   });
   
// setup another route to listen on /images/add
app.get("/images/add", function(req,res){
   //res.sendFile(path.join(__dirname, "/views/addImage.html"));
   res.render('addImage');
});

// setup post route for POST/images/add 
app.post("/images/add", upload.single("imageFile"), (req, res) => {
   res.redirect("/images");
 });

 // setup another route to listen on /images
app.get("/images", function(req,res){ 
   var path = "./public/images/uploaded"
   fs.readdir(path, function(err, images) {
     // var array = {images};
      //res.json(array);
      res.render("images", {data: images});
   });
});

//Returns "404: Page not found if path not found"
app.use((req, res) => {
   res.status(404).send("404: Page Not Found");
 });
 
// setup http server to listen on HTTP_PORT
dataService.initialize().then(() => app.listen(HTTP_PORT, onHttpStart))
.catch(err => console.log(err));

  


