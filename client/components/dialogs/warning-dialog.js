Template.warningDialog.events = {
    'click .warning-dialog-ok' : function(e) {
      Meteor.call("deleteLabel", Session.get("currentRepoId"), $("#warningDialog").attr('data-label-name'));
      $('#warningDialog').modal("hide");
    }
};