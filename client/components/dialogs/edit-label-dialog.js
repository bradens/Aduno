Template.editLabelDialog.events = {
    'keyup #label-edit-color' : function(e) {
      workflow.labelColorEdited($(".color-block"), $(e.target).val());
    },
    'click .edit-label-dialog-save' : function(e) {
      // Update Collection
      dialog = $("#editLabelDialog");
      id = dialog.attr('edit-label-id');
      name = dialog.find("#labelName").val();
      color = dialog.find("#label-edit-color").val();
      if (color.indexOf("#") != -1)
        color = color.substring(1);
      var id = dialog.attr("editing-label-id")
      Labels.update(id, {$set : {name : name, color: color, dirty: true}});
      Meteor.call('updateLabels', Session.get("currentRepoId"));
      $('#editLabelDialog input').val("");
      dialog.attr("editing", "false");
      dialog.modal("hide");
    }
};