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
      Meteor.call('authenticated', Meteor.user()._id, this.authenticatedCallback);
    };
    this.authenticatedCallback = function() {
      Session.set("user_id", Meteor.user()._id);
      // Initialize the help popover 
      if (Session.get("currentRepoId") === undefined || Session.get("currentRepoId") === null) {
        $("#repo-select-dd-wrapper").popover({
          content: "Select a repository to begin",
          placement: "bottom"
        }).popover('show');
      }
    }
    this.createLabel = function() {
      $("#newLabelDialog").attr("editing", "false");
      $("#newLabelDialog input").val("");
      $("#newLabelDialog").modal();
    };
    this.labelColorEdited = function($elem, col) {
      $elem.css('background-color', col);
    };

    this.loadRepository = function(repoName, repoId, repoOwner) {
      Session.set("currentRepo", repoName);
      Session.set("currentRepoId", repoId);
      Meteor.call("loadStories", Session.get("currentRepoId"), defines.noop);
      Meteor.call('loadLabels',
                  repoOwner,
                  repoName, defines.noop);
      Meteor.call('loadIssuesWithLabels', 
                  repoOwner,
                  repoName,
                  [], defines.noop);
      Session.set("STORY_VIEW", true);
      Session.set("WORKITEM_VIEW", false);
      Session.set("currentStoryId", null);  
    };

    this.loadingCallback = function() {
      if (Session.get("loadingQueueCount") !== undefined &&
          typeof Session.get("loadingQueueCount") === "number") {
        Session.set("loadingQueueCount", Session.get("loadingQueueCount") - 1);
      }
      if (Session.get("loadingQueueCount") <= 0) {
        // Clear the notification
        workflow.hideNotification();
      }
    };

    this.loading = function() {
      if (Session.get("loadingQueueCount") !== undefined &&
          typeof Session.get("loadingQueueCount") === "number") {
        Session.set("loadingQueueCount", Session.get("loadingQueueCount") + 1);
      }
      else {
        Session.set("loadingQueueCount", 1);
      }
      if (Session.get("loadingQueueCount") >= 1) {
        workflow.showNotification({ 
          type: 'loading', 
          imageHtml: "", 
          title: "Loading...", 
          subtext: "Hang tight" 
        });
      }
    };

    // Displays a notification which is rendered as 
    // Template.notifier (notifier.html)
    // Requires: 
    // params {
    //   type: defines.notificationType,
    //   imageHtml: htmlString  // an image html tag for your notification (spinner?)
    //   title: String
    //   subtext: String   
    // }
    this.showNotification = function(params) {
      if (defines.LOADING_TYPES.indexOf(params.type) === -1) {
        console.log("ERROR: Wrong notification type");
        return;
      }
      $not = $("#notifier-wrapper");
      if (!$not.exists()) {
        $("body").append(Meteor.render(Template.notifier(params)));
        $not = $("#notifier-wrapper");
      }
      $not.fadeIn();
    };

    // Removes the notification.
    this.hideNotification = function() {
      $not = $("#notifier-wrapper");
      if ($not.exists()) {
        $not.fadeOut(function() { 
          $not.remove();
        });
      }
    };
  }
});