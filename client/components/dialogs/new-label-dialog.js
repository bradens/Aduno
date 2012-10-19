Template.newLabelDialog.events = {
    'click .new-label-dialog-save' : function(e) {
      // Update Collection
      dialog = $("#newLabelDialog");
      id = dialog.attr('new-label-id');
      name = dialog.find("#labelName").val();
      color = dialog.find("#labelColor").val();
      Meteor.call('addLabel', userId, Session.get("currentRepo"), {name: name, color: color}); 
      $('#newLabelDialog input').val("");
      $('#newLabelDialog').modal("hide");
    }
};