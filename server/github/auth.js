/**
 * repos.js
 * Aduno project (http://aduno.braden.in)
 * @author Braden Simpson (@bradensimpson)
 * 
 * Define the methods used for server processing here.
 */
var Fiber = Npm.require('fibers');
Meteor.methods({
	authenticated : function(user_id) {
		Meteor.call("checkBadge", user_id);
    var user = Meteor.users.findOne(this.userId);
    Meteor.users.update(this.userId, {$set : {uniqueName: user.services.github.username}});
    github.authenticate ({
      type: "oauth",  
      token: user.services.github.accessToken
    });
    Meteor.call('loadRepos', user_id);
    Meteor.call("authenticatedCallback");
  },
  loadAuth: function() {
    github.authenticate ({
      type: "oauth",  
      token: Meteor.users.findOne(this.userId).services.github.accessToken
    });
  }
});