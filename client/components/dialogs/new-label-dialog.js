Template.newLabelDialog.events = {
    'keyup #label-new-color' : function(e) {
      workflow.labelColorEdited($(".color-block"), $(e.target).val());
    },
    'click .new-label-dialog-save' : function(e) {
      // Update Collection
      dialog = $("#newLabelDialog");
      id = dialog.attr('new-label-id');
      name = dialog.find("#labelName").val();
      color = dialog.find("#label-new-color").val();
      if (color.indexOf("#") != -1)
        color = color.substring(1);
      Meteor.call('addLabel', Repos.findOne(Session.get("currentRepoId")).owner, Session.get("currentRepo"), Session.get("currentRepoId"), {name: name, color: color}); 
      $('#newLabelDialog input').val("");
      dialog.modal("hide");
    }
};