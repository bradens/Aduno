/**
 * main.js
 * Aduno project (http://aduno.braden.in)
 * @author Braden Simpson (@bradensimpson)
 * 
 * Main methods for the template.
 */
Template.main.isLoading = function() {
  return (Session.get('loading'));
};

Template.main.areServicesConfigured = function () {
    return Accounts.loginServiceConfiguration.find({ service: 'github' }).count() > 0;
};

Template.main.userLogin = function () {
    return Meteor.user();
};

Template.main.repoID = function () {
    return Session.get('currentRepoId')
};

Template.main.rendered = function() {
  // redraw our canvas
  if (window.workboard !== undefined)
    window.workboard.draw();
  $('.tooltip').remove(); 
  // re-init our tooltip
  $('[rel=tooltip]').tooltip();
  $('[rel=popover]').popover();
}

Template.main.events = {
  'click #newWorkItem' : function () {
    workboard.createNewWorkItem();
  },
  'click #newLabel' : function() {
    workflow.createLabel();
  },
  'click #select-repo a': function() {
    $("#select-repo-dialog").modal();
  },
  'click #configure-aduno a': function() {
    $('#configDialog').modal();
  },
  'click #user-login a': function() {
    Meteor.loginWithGithub({requestPermissions: ['user', 'public_repo']});
  },
  'click a.editLabelBtn' : function(e) {
    var labelname = $(e.target).closest("[data-label-name]").attr('data-label-name');
    var label = Labels.findOne({name : labelname, repo_id: Session.get("currentRepoId")});
    $editedLabel = $("#editLabelDialog");
    $editedLabel.attr("editing-label-id", label._id);
    $editedLabel.find("#label-color-edit").val(label.color);
    $editedLabel.find("#labelName").val(label.name);
    $editedLabel.modal();
    e.stopPropagation();
  },
  'click .filter-labels li:not(".nav-header")' : function(e) {
    if (workflow.IS_EDITING_LABELS) return false;
    Meteor.call('loadIssuesWithLabels', 
        Meteor.user()._id, 
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
    })
  }
};
Template.main.workitems = function() {
  if (Session.get("currentLabel") && Session.get("currentLabel") != "all") {
    return  WorkItems.find({
      name: {
        $ne: ""
      },
      'labels.name': Session.get("currentLabel")
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
