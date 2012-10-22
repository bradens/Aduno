/**
 * work-item.js
 * Aduno project (http://aduno.meteor.com)
 * @author Braden Simpson (@bradensimpson)
 * 
 * Work-item template javascript.  
 */
Template.workitem.redrawAfterUpdate = function() {
    workboard.draw();
};
Template.workitem.title = function() {
  return "New WorkItem";
}

Template.workItemTitleEditor.events = {
    'keyup input' : function(e) {
      $id = $(e.target).closest('#work-item-title-editor').attr('editing-id');
      WorkItems.update($id, {$set : {
        name: e.target.value
      }});
    },
    'blur input' : function(e) {
      $wie = $("#work-item-title-editor");
      $wie.find('input').val("");
      $wie.fadeOut('fast');
    }
}
Template.workitem.events = {
  'click .editTitleBtn' : function (e) {
    showWiDialog($(e.currentTarget).closest(".workItem").attr('data-wi-id'));
    $('#wiNameDetails').focus();
  },
  'click .details' : function (e) {
    showWiDialog($(e.currentTarget).closest(".workItem").attr('data-wi-id'));
  },
  'click h4.workItemTitle' : function(e) {
    $wiEditor = $("#work-item-title-editor");
    pos = $(e.target).offset();
    pos.top = pos.top - ($wiEditor.height() + 30);
    $wiEditor.css({
      top: pos.top,
      left: pos.left
    }).fadeIn('fast');
    $wiEditor.attr('editing-id', $(e.target).closest('[data-wi-id]').attr('data-wi-id'));
    $wiEditor.find('input').val(e.target.innerText).focus();
    e.stopPropagation();
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
  'keyup .workItemTitle' : function(e) {
    console.log(e);
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