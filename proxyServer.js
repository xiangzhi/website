/**
 * proxyServer.js
 * node server that routes request to respective servers
 *
 * author: zhi
 * last update:9/4/2015
 **/

//nodejs modules
var http = require('http');
var fs =require("fs");
var https = require('https');
var path = require("path");
//3rd party npm modules
var httpProxy = require('http-proxy'); //for proxy server
require('console-stamp')(console, 'm/dd/yy HH:MM:ss.l'); //override console for a timestamp version

//read the settings file
var configFile = {};
var env = process.env.NODE_ENV || 'dev';
console.log("in " + env + " mode");
loadConfigFile(path.join( __dirname,"configFiles",env + ".json"));

function loadConfigFile(fileName){
    //first read th efile
    var raw = JSON.parse(fs.readFileSync(fileName)); 
    configFile["webServer"] = raw.webServer;
    configFile["httpPortNum"] = raw.httpPortNum;
    configFile["httpsPortNum"] = raw.httpsPortNum;
    //load the keyFile
    //we do the reading here as well
    configFile["keyFile"] = fs.readFileSync(path.join(process.env['HOME'],raw.keyLocation));
    configFile["certFile"] = fs.readFileSync(path.join(process.env['HOME'],raw.certLocation));
    configFile["ca"] = [];
    //check if there is intermedia ca files
    if(raw.caLocation){
        configFile["ca"] = [];
        raw.caLocation.forEach(function(value, i){
            configFile["ca"].push(fs.readFileSync(path.join(process.env['HOME'],value)));
        })
    }
	console.log(configFile["ca"]);
}


/** constants **/
/*
//Server Addresses
var webServerAddress = "http://localhost:8080";
//certs
var keyFilePath = path.join(process.env['HOME'], 'certs/xiangzhitan-key.pem');
var certFilePath = path.join(process.env['HOME'], 'certs/xiangzhitan-cert.pem');
var rootCAFilePath = path.join(process.env['HOME'], 'certs/xiangzhitan-rootCA.pem');
var interCA1FilePath = path.join(process.env['HOME'], 'certs/xiangzhitan-comodo-1.pem');
var interCA2FilePath = path.join(process.env['HOME'], 'certs/xiangzhitan-comodo-2.pem');
*/

//https options
httpsOptions = {
    key: configFile["keyFile"],
    cert: configFile["certFile"],
    ca: configFile["ca"],
    ciphers: [
    "ECDHE-RSA-AES256-SHA384",
    "DHE-RSA-AES256-SHA384",
    "ECDHE-RSA-AES256-SHA256",
    "DHE-RSA-AES256-SHA256",
    "ECDHE-RSA-AES128-SHA256",
    "DHE-RSA-AES128-SHA256",
    "HIGH",
    "!aNULL",
    "!eNULL",
    "!EXPORT",
    "!DES",
    "!RC4",
    "!MD5",
    "!PSK",
    "!SRP",
    "!CAMELLIA"
    ].join(':'),
    honorCipherOrder: true,
    requestCert: false,
    rejectUnauthorized: true
}

//create proxy server
var proxy = httpProxy.createProxyServer();
//link up with http server
var server = https.createServer(httpsOptions, function(req,res){
    //gather information about incoming ip
    var incomingIP = req.headers['x-forwarded-for'] || 
     req.connection.remoteAddress || 
     req.socket.remoteAddress ||
     req.connection.socket.remoteAddress;
    //log it
	console.log("new connection from:" + incomingIP);
    //redirect to web server
	proxy.web(req,res,{target: configFile["webServer"]});
});


//route to 404 if there is an error
proxy.on('error', function (err, req, res) {
    console.error("Error:" + err);
  res.writeHead(500, {
    'Content-Type': 'text/plain'
  });

  res.end('Server Internal Error');
});

//start server

//https server listening at port decided by settings file
server.listen(configFile["httpsPortNum"], function(){
    console.log('https proxyServer listening at ' + configFile["httpsPortNum"]);
});

//a http server that redirects traffic to the https server by asking them to reconnect
//redirect https to https
var unsecureServer = http.createServer(function(req, res) {
  console.log("http access, redirect to https");
  res.writeHead(301, {
    Location: "https://" + req.headers["host"].replace("www.", "") + req.url
  });
  res.end();
}).listen(configFile["httpPortNum"], function(){
    console.log("http redirect server listening at " + configFile["httpPortNum"]);
});
