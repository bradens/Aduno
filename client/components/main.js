/**
 * main.js
 * Aduno project (http://aduno.meteor.com)
 * @author Braden Simpson (@bradensimpson)
 * 
 * Main methods for the template.
 */

Template.main.rendered = function() {
  // redraw our canvas
  if (window.workboard !== undefined)
    window.workboard.draw();
  // re-init our tooltips
  $('[rel=tooltip]').tooltip();
}

Template.main.events = {
  'click #newWorkItem' : function () {
    workboard.createNewWorkItem();
  },
  'click a.editLabelBtn' : function(e) {
    workflow.editLabelMode(!workflow.IS_EDITING_LABELS);
  },
  'keyup .filter-labels li a' : function(e) {
    if ($(e.target).hasClass("editable")) {
      Labels.update($(e).attr('data-label-id'), {$set: {name: $(e.target).html()}});
    }
  },
  'click .filter-labels li:not(".nav-header")' : function(e) {
    if (workflow.IS_EDITING_LABELS) return false;
    Meteor.call('loadIssuesWithLabels', 
        Meteor.user().services.github.username, 
        Session.get('currentRepo'),
        [$(e.target).attr("data-label-name")]
    );
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
      'labels._id': Session.get("currentLabel")
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
Template.main.getEditingLabelStateMsg = function() {
  return Session.get("IS_EDITING_LABELS_MSG");
}
Template.labelItem.checkLabelActive = function() { 
  if (Session.get("currentLabel") != "all" && this.label.name == Labels.findOne(Session.get("currentLabel")).label.name) {
    return "active";
  }
  return "";
};
Template.main.labels = function() {
    return Labels.find({
      repo_id: Session.get("currentRepoId"),
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
