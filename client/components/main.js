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
  'click #newLabel' : function() {
    workflow.createLabel();
  },
  'click a.editLabelBtn' : function(e) {
    var labelname = $(e.target).closest("[data-label-name]").attr('data-label-name');
    var label = Labels.findOne({'label.name' : labelname, repo_id: Session.get("currentRepoId")});
    $newLabel = $("#newLabelDialog");
    $newLabel.attr("editing", "true");
    $newLabel.attr("editing-label-id", label._id);
    $newLabel.find("#labelColor").val(label.label.color);
    $newLabel.find("#labelName").val(label.label.name);
    $newLabel.modal();
    e.stopPropagation();
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
      Session.set("currentLabel", $(e.target).attr('data-label-name'));
    }
  },
  'click #synchronize' : function() {
    Meteor.call(
        'synchronize', 
        Meteor.user().services.github.username, 
        Session.get("currentRepo"),
        Session.get("currentRepoId"),
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
      'labels.label.name': Session.get("currentLabel")
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
