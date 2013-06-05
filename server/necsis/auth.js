/**
 * repos.js
 * Aduno project (http://aduno.braden.in)
 * @author Braden Simpson (@bradensimpson)
 * 
 * Define the methods used for server processing here.
 */
var Fiber = Npm.require('fibers');
Meteor.methods({
	createAccount: function(options) {
		log(Accounts.createUser(options));
	},
	authenticated : function(user_id) {
		Meteor.call("checkBadge", user_id);
    Meteor.call('loadRepos', user_id);
    Meteor.call("authenticatedCallback");
  }
});

// Need to add the uniqueName on the user
Accounts.onCreateUser(function(options, user) {
  user.uniqueName = user.username;
  // We still want the default hook's 'profile' behavior.
  if (options.profile)
    user.profile = options.profile;
  return user;
});