Template.warningDialog.events = {
    'click .warning-dialog-ok' : function(e) {
      Meteor.call("deleteLabel", Session.get("currentRepoId"), $("#warningDialog").attr('current-label-name'));
      $('#warningDialog').modal("hide");
    }
};