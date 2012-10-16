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
    if ($(e.target).attr('data-label-name') == "all") {
      Session.set("currentLabel", "all");
    }
    else {
      Session.set("currentLabel", Labels.findOne({repo_id: Session.get("currentRepoId"), 'label.name': $(e.target).attr('data-label-name')})._id);
    }
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
  if (Session.get("currentLabel") && Session.get("currentLabel") != "all") {
    return  WorkItems.find({
      name: {
        $ne: ""
      },
      labels: Labels.findOne(Session.get("currentLabel")).label
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
Template.main.checkAllLabel = function() {
  if (Session.get("currentLabel") == "all")
    return "active";
  else
    return "";
};
Template.labelItem.labelName = function() {
  return this.label.name;
};
Template.labelItem.checkLabelActive = function() { 
  if (Session.get("currentLabel") != "all" && this.label.name == Labels.findOne(Session.get("currentLabel")).label.name) {
    return "active";
  }
  return "";
};
Template.main.labels = function() {
//  if (!Session.get("currentLabel")  || Session.get("currentLabel") == "all") {
      return Labels.find({
        repo_id: Session.get("currentRepoId"),
      });
//  }
//  else {
//    return Labels.find({
//      repo_id: Session.get("currentRepoId"),
//      _id: Session.get("currentLabel")
//    });
//  }
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
