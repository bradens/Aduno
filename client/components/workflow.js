/**
 * workboard.js
 * Aduno project (http://aduno.meteor.com)
 * @author Braden Simpson (@bradensimpson)
 * 
 * Workboard code.  Used for manipulating the 'workboard' which is the name of the
 * main working area of Aduno.
 */

$(function() {
  if (window.workflow == undefined)
  {
    window.workflow = new WorkFlow(); 
  }
  function WorkFlow() {
    this.IS_LOGGING_IN = false;
    this.IS_LOGGED_IN = false;
    this.loggedIn = function () {
      this.IS_LOGGED_IN = true;
      if (Meteor.user())
        Meteor.call('keepalive', Meteor.user()._id);
      
      Meteor.call('authenticated', Meteor.user()._id, authenticatedCallback);
      
      function authenticatedCallback() {
        Session.set("user_id", Meteor.user()._id);
        Meteor.call('loadRepos', Meteor.user()._id, workflow.loadedReposCallback);
      }
    };
    this.loadedReposCallback = function(res) {
      console.log("finished loading repos");
    };
    this.issuesLoaded = function() {
      console.log('issuesLoaded');
    };
    this.labelsLoaded = function() {
      console.log('labelsLoaded');
    };
  }
});