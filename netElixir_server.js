/* jshint node: true */
"use strict";
//require("harmonize")();
var http = require('http');
var router = require('./server/router.js');
var cluster = require('cluster');
var numCPUs = require('os').cpus().length;
var connect = require('connect');
var errorhandler = require('errorhandler');
var localPath = __dirname + '/public/';//where our public files are located
var app = connect();
// store session state in browser cookie
var cookieSession = require('cookie-session');
app.use(cookieSession({
    keys: ['net', 'erixo']
}));
app.use(function onerror(err, req, res, next) {
   res.end("error occured");
});


process.env.NODE_ENV = "development";
if(process.env.NODE_ENV == "development"){
    //error handler middleware
    app.use(errorhandler());
}
//create process threads depending on Machine processor
if(cluster.isMaster){
    for (var i = 0; i < numCPUs; i++) {
        cluster.fork();
    }
    Object.keys(cluster.workers).forEach(function(id) {
        //console.log(colors.green("Process running with ID : "+cluster.workers[id].process.pid));
        console.log("Process running with ID : ", cluster.workers[id].process.pid);
    });
    cluster.on('exit', function(worker, code, signal) {
        console.log('worker ' + worker.process.pid + ' died');
    });
}
else{
    app.use(function(req, res){
        //route the request and response
        router.route_functions(req, res, localPath);

    });
    var httpapp = http.createServer(app).listen(3001);
    console.log( 'server started on port ', 3001 );
}
//Handle the Unexpected Exception
process.on('uncaughtException', function (err) {
    console.log("grom global uncaughtException");
    console.error(err);
});
module.exports = app;