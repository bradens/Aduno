Template.warningDialog.events = {
    'click .warning-dialog-ok' : function(e) {
      Meteor.call("deleteLabel", Meteor.user()._id, Repos.findOne(Session.get("currentRepoId")).owner, Session.get("currentRepo"), $("#warningDialog").attr("current-label-name"));
      $('#warningDialog').modal("hide");
    }
};