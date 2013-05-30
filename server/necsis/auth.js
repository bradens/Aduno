/**
 * repos.js
 * Aduno project (http://aduno.braden.in)
 * @author Braden Simpson (@bradensimpson)
 * 
 * Define the methods used for server processing here.
 */
var Fiber = Npm.require('fibers');
Meteor.methods({
	createAccount: function(name, username, email, password) {
		log(Accounts.createUser({username:username, password:password, email:email, name: name}));
	},
	authenticated : function(user_id) {
		Meteor.call("checkBadge", user_id);
    Meteor.call('loadRepos', user_id);
    Meteor.call("authenticatedCallback");
  }
});