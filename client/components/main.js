/**
 * main.js
 * Aduno project (http://aduno.meteor.com)
 * @author Braden Simpson (@bradensimpson)
 * 
 * Main methods for the template.
 */

Template.main.events = {
  'click #newWorkItem' : function () {
    workboard.createNewWorkItem();
  },
  'click .filter-labels li' : function(e) {
    Meteor.call('loadIssuesWithLabels', 
        Meteor.user().services.github.username, 
        Session.get('currentRepo'),
        [$(e.target).attr("data-label-name")],
        workflow.issuesLoaded);
    Session.set("currentLabel", $(e.target).attr('data-label-name'));
  },
  'click #synchronize' : function() {
    Meteor.call(
        'synchronize', 
        Meteor.user().services.github.username, 
        Session.get("currentRepo"),
        function(e) {
          console.log("synchronized");
        }
    );
  },
  'keyup #usernameInput' : function (e) {
    var name;
    name = $('input#usernameInput').val().trim();
    return People.update(Session.get('user_id'), {
      $set: {
        name: name
      }
    });
  }
};
Template.main.workitems = function() {
  if (Session.get("currentLabel") != "all") {
    return  WorkItems.find({
      name: {
        $ne: ""
      },
      labels: Session.get("currentLabel")
    }, { 
      sort: {
        name: 1
      }
    });
  } else {
    return WorkItems.find({
      name: {
        $ne: ""
      },
    }, { 
      sort: {
        name: 1
      }
    });
  }
};
Template.labelItem.checkLabelActive = function() { 
  if (Session.get("currentLabel") == "all" || this.name == Session.get("currentLabel")){
    return "active";
  }
  return "";
}
Template.main.labels = function() {
  return Labels.find({
    repo_id: Session.get("currentRepoId")
  });
};
Template.main.links = function() {
  return Links.find({
    parentID: {
      $ne: ""
    },
    childID: {
      $ne: ""
    }
  }, { 
    sort: {
      linkedID: 1
    }
  });
};
