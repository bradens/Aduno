/**
 * repos.js
 * Aduno project (http://aduno.braden.in)
 * @author Braden Simpson (@bradensimpson)
 * 
 * Define the methods used for server processing here.
 */
var Fiber = Npm.require('fibers');
Meteor.methods({
	// Load Github repos for a user.
  // We will *always* give preference to a github repos information
  // since it controls who has access to what.
  // This will update the github repo side, which will be used to switch
  // to our 'aduno' draft versions of each repo.
  loadRepos: function (user_id) {
    Meteor.call("loadAuth");
	}
});