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

Template.main.isWorkitemView = function() {
  return Session.get("WORKITEM_VIEW");
};

Template.main.getWorkboardTitle = function() {
  var story = Stories.findOne(Session.get("currentStoryId"));
  if (story) {
    return story.name;  
  }
  else
    return null;
};

Template.main.rendered = function() {
  // redraw our canvas
  if (window.workboard !== undefined)
    window.workboard.draw();

  // Initialize our workboard if it's here.
  $('#myCanvas').resizable({
    resize: function(event, ui) {
      $(ui.element.context).attr('width', ui.size.width);
      $(ui.element.context).attr('height', ui.size.height);
      workboard.draw();
    }
  });

  $('.tooltip').remove(); 
  // re-init our tooltip
  $('[rel=tooltip]').tooltip({container: "body"});
  $('[rel=popover]').popover({container: "body"});
}
/*
Template.main.login = function() {
    // Update Collection
    $dlg = $("#login-dialog");

    var user = $dlg.find("#login-username").val(),
        pass = $dlg.find("#login-password").val();

    Meteor.loginWithPassword(user, pass, function(res) {
      console.log(res);
    });
    $('#login-dialog input').val("");
    $dlg.modal("hide");
}
*/

Template.main.events = {
    'click .github-login' : function() { 
      Meteor.loginWithGithub({requestPermissions: ['user', 'public_repo']});
    },

    /*,
    'click .login-dialog-login' : function() {
      Template.main.login();
    },
    'keyup form' : function(e) {
      if (e.keyCode == 13) {
        Template.main.login();
      }
    }*/

  'click #user-create a' : function() {
    $("#user-create-dialog").modal();
  },
  'click #newWorkItem' : function () {
    workboard.createNewWorkItem();
  },
  'click #newStoryItem': function() {
    workboard.createNewStoryItem();
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
    $("#login-dialog").modal();
  },
  'click a.editLabelBtn' : function(e) {
    var labelname = $(e.target).closest("[data-label-name]").attr('data-label-name');
    var label = Labels.findOne({name : labelname, repo_id: Session.get("currentRepoId")});
    $editedLabel = $("#editLabelDialog");
    $editedLabel.attr("editing-label-id", label._id);
    $editedLabel.find("#label-edit-color").val("#" + label.color);
    workflow.labelColorEdited($(".color-block"), "#"+label.color);
    $editedLabel.find("#labelName").val(label.name);
    $editedLabel.modal();
    e.stopPropagation();
  },
  'click .filter-labels li:not(".nav-header")' : function(e) {
    Meteor.call('loadIssuesWithLabels', 
        Meteor.user().uniqueName, 
        Session.get('currentRepo'),
        [$(e.target).attr("data-label-name")],
        defines.noop
    );
    if ($(e.target).attr('data-label-name') == "all") {
      Session.set("currentLabel", "all");
    }
    else {
      Session.set("currentLabel", $(e.target).attr('data-label-name'));
    }
  },
  'click #back' : function() {
    Session.set("STORY_VIEW", true);
    Session.set("WORKITEM_VIEW", false);
    Session.set("currentStoryId", null);
  },
  'click #synchronize' : function() {
    Meteor.call(
        'synchronize', 
        Session.get("currentRepo"),
        Session.get("currentRepoId"),
        defines.noop
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
Template.main.stories = function() {
  if (Session.get("STORY_VIEW")) {
    if (Session.get("currentLabel") && Session.get("currentLabel") != "all") {
      return  Stories.find(
        {
          'labels.name': Session.get("currentLabel")
        }, { 
        sort: {
          name: 1
        }
      });
    } else {
      return Stories.find({},
      { 
        sort: {
          name: 1
        }
      });
    }
  }
  else {
    return {};
  }
};
Template.main.workitems = function() {
  if (Session.get("currentStoryId")) {
    if (Session.get("currentLabel") && Session.get("currentLabel") !== "all") {
      return WorkItems.find({
        story_id: Session.get("currentStoryId"),
        'labels.name': Session.get("currentLabel")
      },
      { 
        sort: {
          name: 1
        }
      });
    }
    else {
      return WorkItems.find({}, 
      { 
        sort: {
          name: 1
        }
      });
    }
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
