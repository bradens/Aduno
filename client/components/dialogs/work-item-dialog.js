/**
 * work-item-dialog.js
 * Aduno project (http://aduno.meteor.com)
 * @author Braden Simpson (@bradensimpson)
 * 
 * Initialization for all client side code.
 */
Template.wiDialog.events = {
  'click .wiDialogCancel' : function (e) {
    //todo cancel?
  },
  'click .wiDialogSave' : function(e) {
    // Update Collection
    dialog = $("#wiDetailsDialog");
    id = dialog.attr('editing-wi-id');
    name = dialog.find("#wiNameDetails").val();
    description = dialog.find("#wiDescDetails").val();
    WorkItems.update(
        id,
        { $set: {
          name: name, 
          description: description
        }
        });
    clearDetailsDialogFields();
    $('#wiDetailsDialog').modal("hide");
  }
};

function clearDetailsDialogFields()
{
  $('#wiDetailsDialog input, #wiDetailsDialog textarea').html('');
}

function showWiDialog(id)
{
  wi = WorkItems.findOne({_id: id});
  $('#wiNameDetails').val(wi.name);
  $('#wiDescDetails').val(wi.description);
  $('#wiDetailsDialog').attr('editing-wi-id', id);
  $('#wiDetailsDialog').modal().on("hidden", function() {
    workboard.userStopEditingItem(id);
  });
}