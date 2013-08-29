/**
 * server-init.js
 * Aduno project (http://aduno.braden.in)
 * @author Braden Simpson (@bradensimpson)
 * 
 * Loading all modules and doing pathing to require 
 * npm packages.
 */
var path = Npm.require("path"),
      fs = Npm.require('fs'),
      Fiber = Npm.require('fibers');

github = new GitHub({
    version: "3.0.0"
});

ADUNO = { };
ADUNO.debug = true;

// Utility function for assigning badges to users, 
// TODO @bradens replace with hashing function on their names
randomBadge = function() {
  var labels = ['', 'label-success', 'label-warning', 'label-important', 'label-info', 'label-inverse'];
  return labels[Math.round((Math.random()*6))];
}

log = function(msg) {
  if (ADUNO.debug) {
    console.log(msg);
  }
}

// TODO @bradens
// Figure out permissions here.
Meteor.startup(function() {
  var canModify = function(userId, tasks) {
    return _.all(tasks, function(task) {
      return !task.privateTo || task.privateTo === userId;
    });
  };
  StoryLinks.allow({
    insert: function () { return true; },
    update: function () { return true; },
    remove: function () { return true; }
  });
  Stories.allow({
    insert: function () { return true; },
    update: function () { return true; },
    remove: function () { return true; }
  });
  WorkItems.allow({
    insert: function () { return true; },
    update: function () { return true; },
    remove: function () { return true; }
  });
  Notifications.allow({
    insert: function () { return true; },
    update: function () { return true; },
    remove: function () { return true; }
  })
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