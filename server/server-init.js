/**
 * server-init.js
 * Aduno project (http://aduno.meteor.com)
 * @author Braden Simpson (@bradensimpson)
 * 
 * Loading all modules and doing pathing to require 
 * npm packages.
 */
var require = __meteor_bootstrap__.require;
var path = require("path");
var fs = require('fs');
var GitHubApi;
var gitPath = 'node_modules/github';

var base = path.resolve('.');
if (base == '/'){
  base = path.dirname(global.require.main.filename);   
}

var publicPath = path.resolve(base+'/public/'+gitPath);
var staticPath = path.resolve(base+'/static/'+gitPath);

if (path.existsSync(publicPath)){
	GitHubApi = require(publicPath);
}
else if (path.existsSync(staticPath)){
	GitHubApi = require(staticPath);
}
else{
  console.log('node_modules not found');
}

var github = new GitHubApi({
    version: "3.0.0"
});

//server code: clean up dead clients after 5 seconds
Meteor.setInterval(function () {
  var now = (new Date()).getTime();
  var remove_threshold = now - 20*1000;
  People.find({last_keepalive: {$lt: remove_threshold}}).forEach(function (user) {
    console.log(user);
  });
  
  People.remove({last_keepalive: {$lt: remove_threshold}});
}, 5*1000);