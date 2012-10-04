/**
 * work-item.js
 * Aduno project (http://aduno.meteor.com)
 * @author Braden Simpson (@bradensimpson)
 * 
 * Work-item template javascript.  
 */
Template.workitem.redrawAfterUpdate = function() {
  Meteor.defer(function() {
    workboard.draw();
  });
};

Template.workitem.title = function() {
  return "New WorkItem";
}

Template.workitem.events = {
  'click .editTitleBtn' : function (e) {
    showWiDialog($(e.currentTarget).closest(".workItem").attr('data-wi-id'));
    $('#wiNameDetails').focus();
  },
  'click .details' : function (e) {
    showWiDialog($(e.currentTarget).closest(".workItem").attr('data-wi-id'));
  },
  'click .wiDelete' : function (e) {
    var wiID = $(e.currentTarget).closest(".workItem").attr('data-wi-id');
    // Remove the WorkItem
    WorkItems.remove({_id: wiID});
    // Remove the Links
    Links.remove({parentID: wiID});
    Links.remove({childID: wiID});
  },
  'click .linkWI' : function(e) {
    workboard.is_Linking = true;
    workboard.currentLineID = $(e.currentTarget).closest(".workItem").attr("data-wi-id");
    e.stopPropagation();
  },
  'click .workItem' : function (e) {
    if (workboard.is_Linking)
    {
      workboard.is_Linking = false;
      // finish the link;
      Links.insert({
        repo_id: Session.get("currentRepoId"),
        parentID: workboard.currentLineID,
        childID: $(e.currentTarget).closest(".workItem").attr('data-wi-id')
      });
    }
  },
  'click .postIssue' : function(e) {
    if (!People.findOne({_id: Session.get('user_id')}).is_authenticated)
      $("#authDialog").modal();
    else
      Meteor.call('postWorkItemAsIssue', $(e.currentTarget).closest(".workItem").attr('data-wi-id'));
  },
  'mouseover .workItem' : function() {
    $('#wi_'+this._id).draggable({
      containment: '#myCanvas'
    });
  }
};