//Server for API call to Db2 database
//@author Andrew Laidlaw
//@version 1.0

// Pull in required supporting pacakges and set up Express application
var express=require('express');
var app=express();
var bodyParser=require('body-parser');
const ibmdb = require('ibm_db');

// Set the port to listen on for our web server
app.set('port',process.env.PORT || 8080)

// Configure the Express application (app) options
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

// Setup the endpoint for the Db2 database we are connecting to
let connStr = "DATABASE="+process.env.DB_DATABASE+";HOSTNAME="+process.env.DB_HOSTNAME+";PORT="+process.env.DB_PORT+";PROTOCOL=TCPIP;UID="+process.env.DB_UID+";PWD="+process.env.DB_PWD+";";

// Basic healthcheck endpoint
app.get('/healthz', function(request, response) {
  console.log('Healthcheck');
  response.send('ok');
})

// Simple JSON response for base service
app.get('/', function(request, response) {
  console.log('Request for /');
  response.json({success:1, message:'service running'});
})

// Get an object containing all details of all products in the database
app.get('/getProducts', function(request, response) {
  console.log("Request for /getProducts");
  ibmdb.open(connStr, function (err,conn) {
    if (err){
      console.log(err);
      return response.json({success:-1, message:err});
    }
    // Defined SQL query is run against the database
    // The returned data is in JSON format by default
    conn.query("SELECT * FROM "+process.env.DB_SCHEMA+".PRODUCT;", function (err,data) {
      // Handle errors connecting to database
      if (err){
        console.log(err);
        return response.json({success:-2,message:err});
      }
      conn.close(function () {
        console.log("Response provided");
        // Return a JSON object with the returned data
        return response.json({success:1, message:'data received', data:data});
      });
    })
  })
})

// Get an object containing the full details of a particular employee identified by their ID
// Request should be of form <hostname>:8080/getEmployee?id=<employee ID>
app.get('/getEmployee', function(request, response) {
  console.log("Request for /getEmployee with Employee Number "+request.query.id);
  ibmdb.open(connStr, function (err,conn) {
    if (err){
      console.log(err);
      return response.json({success:-1, message:err});
    }
    conn.query("SELECT * FROM "+process.env.DB_SCHEMA+".EMPLOYEE WHERE EMPNO="+request.query.id+";", function (err,data) {
      if (err){
        console.log(err);
        return response.json({success:-2,message:err});
      }
      conn.close(function () {
        console.log("Response provided");
        return response.json({success:1, message:'data received', data:data});
      });
    })
  })
})

// Get an object containing limited details of all employees in the database
// Returns the employee number, first name, last name, and job title of each employee
app.get('/getEmployees', function(request, response) {
  console.log("Request for /getEmployees");
  ibmdb.open(connStr, function (err,conn) {
    if (err){
      console.log(err);
      return response.json({success:-1, message:err});
    }
    conn.query("SELECT EMPNO,FIRSTNME,LASTNAME,JOB FROM "+process.env.DB_SCHEMA+".EMPLOYEE;", function (err,data) {
      if (err){
        console.log(err);
        return response.json({success:-2,message:err});
      }
      conn.close(function () {
        console.log("Response provided");
        return response.json({success:1, message:'data received', data:data});
      });
    })
  })
})


// Get an object containing limited details of all employees in the database
// Returns the employee number, first name, last name, job title, and department name of each employee
app.get('/getAllEmployees', function(request, response) {
  console.log("Request for /getAllEmployees");
  ibmdb.open(connStr, function (err,conn) {
    if (err){
      console.log(err);
      return response.json({success:-1, message:err});
    }
    conn.query("SELECT e.EMPNO,e.FIRSTNME,e.LASTNAME,e.JOB,d.DEPTNAME FROM "+process.env.DB_SCHEMA+".EMPLOYEE e INNER JOIN "+process.env.DB_SCHEMA+".DEPARTMENT d ON e.WORKDEPT = d.DEPTNO;", function (err,data) {
      if (err){
        console.log(err);
        return response.json({success:-2,message:err});
      }
      conn.close(function () {
        console.log("Response provided");
        return response.json({success:1, message:'data received', data:data});
      });
    })
  })
})

// Get an object containing limited details of all employees in the database
// Returns the employee number, first name, last name, and job title of each employee
// This is a synchronous call on the database
app.get('/getEmps', function(request, response) {
  console.log("Request for /getEmps");
  ibmdb.open(connStr, function (err,conn) {
    if (err){
      console.log(err);
      return response.json({success:-1, message:err});
    }
    var output = conn.querySync("SELECT EMPNO,FIRSTNME,LASTNAME,JOB FROM "+process.env.DB_SCHEMA+".EMPLOYEE;");

    conn.close(function () {
      console.log("Response provided");
      return response.json({success:1, message:'data received', data:output});
    })
  })
})

// Start the server listening for clients
app.listen(app.get('port'), function(){
    console.log("Server is listening on port " + app.get('port'));
    console.log('Db2 connection string is: '+ connStr)
})
