Template.newLabelDialog.events = {
    'click .new-label-dialog-save' : function(e) {
      // Update Collection
      dialog = $("#newLabelDialog");
      id = dialog.attr('new-label-id');
      name = dialog.find("#labelName").val();
      color = dialog.find("#labelColor").val();
      if (color.indexOf("#") != -1)
        color = color.substring(1);
      if (dialog.attr("editing") == "true"){
        var id = dialog.attr("editing-label-id")
        Labels.update(id, {$set : {'label.name' : name, 'label.color': color, dirty: true}});
      }
      else {
        Meteor.call('addLabel', Meteor.user().services.github.username, Session.get("currentRepo"), Session.get("currentRepoId"), {name: name, color: color}); 
      }
      $('#newLabelDialog input').val("");
      dialog.attr("editing", "false");
      dialog.modal("hide");
    }
};