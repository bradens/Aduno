Template.warningDialog.events = {
    'click .warning-dialog-ok' : function(e) {
      Meteor.call("deleteLabel", Meteor.user()._id, Meteor.user().services.github.username, Session.get("currentRepo"), $("#warningDialog").attr("current-label-name"));
      $('#warningDialog').modal("hide");
    }
};