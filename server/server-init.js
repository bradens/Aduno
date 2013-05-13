/**
 * server-init.js
 * Aduno project (http://aduno.meteor.com)
 * @author Braden Simpson (@bradensimpson)
 * 
 * Loading all modules and doing pathing to require 
 * npm packages.
 */
var path = Npm.require("path"),
      fs = Npm.require('fs'),
      https = Npm.require('https'),
      url = Npm.require('url'),
      Fiber = Npm.require('fibers');

github = new GitHub({
    version: "3.0.0"
});

randomBadge = function() {
  var labels = ['', 'label-success', 'label-warning', 'label-important', 'label-info', 'label-inverse'];
  return labels[Math.round((Math.random()*6))];
}

Meteor.startup(function() {
  var canModify = function(userId, tasks) {
    return _.all(tasks, function(task) {
      return !task.privateTo || task.privateTo === userId;
    });
  };
  WorkItems.allow({
    insert: function () { return true; },
    update: function () { return true; },
    remove: function () { return true; }
  });
  Links.allow({
    insert: function () { return true; },
    update: function () { return true; },
    remove: function () { return true; }
  });
  Repos.allow({
    insert: function () { return true; },
    update: function () { return true; },
    remove: function () { return true; }
  });
  Labels.allow({
    insert: function () { return true; },
    update: function () { return true; },
    remove: function () { return true; }
  });
    Messages.allow({
    insert: function () { return true; },
    update: function () { return true; },
    remove: function () { return true; }
  });
//  Repos.allow({
//    insert: function () { return true; },
//    update: canModify,
//    remove: canModify,
//    fetch: ['privateTo']
//  });
  
//  Meteor.users.allow({
//    insert: function () { return true; },
//    update: function () { return true; },
//    remove: function () { return true; },
//    fetch: function () { return true; }
//  });
//  Meteor.accounts.configuration.allow({
//    insert: function () { return true; },
//    update: function () { return true; },
//    remove: function () { return true; },
//    fetch: function () { return true; }
//  });
})

//server code: clean up dead clients after 5 seconds
Meteor.setInterval(function () {
  var now = (new Date()).getTime();
  var remove_threshold = now - 5*1000;
  
  var inactiveUsers = ActiveUsers.find({last_keepalive: {$lt: remove_threshold}}).fetch();
  for (var i = 0;i < inactiveUsers.length;i++) {
    Meteor.users.update(inactiveUsers[i].user_id, {$set: {
      idle: true
    }});
    
  }
}, 5*1000);