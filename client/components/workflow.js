/**
 * workboard.js
 * Aduno project (http://aduno.braden.in)
 * @author Braden Simpson (@bradensimpson)
 * 
 */
Template.workflowMenu.getLabelPaneActive = function() {
  return (Session.get("STORY_VIEW") ? "" : "active");
}
Template.workflowMenu.getStoryPaneActive = function() {
  return (Session.get("STORY_VIEW") ? "active" : "");
}

$(function() {
  if (window.workflow == undefined)
  {
    window.workflow = new WorkFlow(); 
  }
  function WorkFlow() {
    this.IS_LOGGING_IN = false;
    this.IS_LOGGED_IN = false;
    this.IS_EDITING_LABELS = false;
    this.loggedIn = function () {
      this.IS_LOGGED_IN = true;
      if (Meteor.user())
        Meteor.call('keepalive', Meteor.user()._id);
      
      Meteor.call('authenticated', Meteor.user()._id);
      Meteor.methods({
        authenticatedCallback: function() {
          Session.set("user_id", Meteor.user()._id);
        }
      });
    };
    this.createLabel = function() {
      $("#newLabelDialog").attr("editing", "false");
      $("#newLabelDialog input").val("");
      $("#newLabelDialog").modal();
    };
    this.labelColorEdited = function($elem, col) {
      $elem.css('background-color', col);
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