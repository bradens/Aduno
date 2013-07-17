/**
 * methods.js
 * Aduno project (http://aduno.braden.in)
 * @author Braden Simpson (@bradensimpson)
 * 
 * Define the methods used for server processing here.
 */
var Fiber = Npm.require('fibers');

Meteor.methods({
  keepalive: function (user_id) {
    if (!(ActiveUsers.findOne({user_id: user_id}))){
      ActiveUsers.insert({
        user_id: user_id,
        last_keepalive: (new Date()).getTime(),
        idle: false
      });
    }
    else {
      ActiveUsers.update({
        user_id: user_id
      },
      { $set: {
        last_keepalive: (new Date()).getTime(),
        idle: false
      }});
    }
  },
  checkBadge: function(user_id) {
    var user = Meteor.users.findOne(user_id);
    var badge = user.badge !== undefined ? user.badge : randomBadge();
    Meteor.users.update({
        _id: user_id
      },
      { $set: {
        idle: false,
        badge: badge
      }
    });
  },
  synchronize: function(reponame, repoId) {
    log("Synchronizing");
    owner = Repos.findOne(repoId).owner;
    Meteor.call('updateLabels', owner, reponame, repoId);
    Meteor.call('updateWorkItems', owner, reponame, repoId);
  },
  removeEditing: function(username) {
    WorkItems.update({'usersEditing.name': username}, {$pull: {usersEditing: {name: username}}});
    Stories.update({'usersEditing.name': username}, {$pull: {usersEditing: {name: username}}});
  }
});