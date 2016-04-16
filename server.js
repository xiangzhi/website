/**
 * web-server/server.js
 * nodejs server that serves the static website
 *
 * author: zhi
 */

//nodejs internal modules
var fs = require("fs");
var path = require("path");
var https = require("https");
//nodejs 3rd party modules
var express = require('express');
var expressHbs = require('express-handlebars');
var bodyParser = require('body-parser');

//constants
var PORT_NUM = 8080;
//var INFO_FILE_PATH = path.join(__dirname, "info.json");

//variables
//load the info path into something persistant
//basically we are using a file as a database
//var latestNews = JSON.parse(fs.readFileSync(INFO_FILE_PATH));
/*
function saveNews(callback){
    fs.writeFile(INFO_FILE_PATH,
        JSON.stringify(latestNews, null, 2), function(err){
            if(err){
                console.error("failed to write news in saveNews");
                return;
            }
            console.log("successfully wrote news to file");
            callback();
        });
}
*/

var app = express();
//use the handlebar rendering engine
app.engine('hbs', expressHbs(
  {
    extname:'hbs', 
    defaultLayout:path.join(__dirname, "/public/master.hbs"),
    helpers: {
      limit: function (arr, limit) {
          //if (!_.isArray(arr)) { return []; } // remove this line if you don't want the lodash/underscore dependency
	return arr	          
//return arr.slice(0, limit);
        }
    }
}));
app.set('view engine', 'hbs');
app.set('views', __dirname + '/public');
//server static files
app.use(express.static(__dirname + '/public'));
//allow json
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
//route to error handler if there is error
app.use(errorHandler);


/* setting for development mode or production mode*/
var env = process.env.NODE_ENV || 'development';
if(env == 'production'){
	 //currently do nothing.
}else{
    //if not production, we always assume it is in development
}

//Base Function
//display my website with the newest news on top
app.get("/", function(req, res ){
    console.log("get - base page");
    var obj = {
        //news:latestNews
    };
    res.render("index.hbs", obj);
    //res.end("hello world");
})
/*
//Function 1
//Adding news to the main page
//without editing any of the code
//a base skeleton of a content management system
app.get("/addNews", function(req, res){
    console.log("get - addNews");
    var obj = {
        news:latestNews
    };
    res.render("add.hbs", obj);
})

app.post("/addNews", function(req, res){
    console.log("post - addNews");
    latestNews.push(req.body);
    //resort the list by the newest is the most recent news
    latestNews.sort(function(a, b){
        return Date.parse(b.date) - Date.parse(a.date);
    })
    console.log("added new news:\n-- start -- \n" + JSON.stringify(req.body, null, 2) + "\n-- end --");
    //save the latest news
    saveNews(function(){
      console.log("added news");
      res.end("added news");
    })
})

app.delete("/addNews", function(req,res){
    console.log("delete - addNews with id:" + req.query.id);
    latestNews.splice(req.query.id,1);
    res.end("deleted news at:" + req.query.id);
})
*/

//redirect any address that doesn't exist in the static files
//to the main page
app.all('*',function(req,res){
	res.redirect('/');
});

//start listening
app.listen(PORT_NUM, function(){
    console.log("server listening at " + PORT_NUM);
    console.log("in " + env + ' mode')
});

/** added features **/

function errorHandler(err, req, res, next){
    //wrote the error to console
    //in production it will be written to the log
    console.error(err.stack);
    //if got response sent a 500
    if(res){
        res.send(500, "Something wrong happened,  we are working on it");
    }
    //nothing else... yeah   
}
