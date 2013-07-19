/**
 * work-item.js
 * Aduno project (http://aduno.braden.in)
 * @author Braden Simpson (@bradensimpson)
 * 
 * Work-item template javascript.  
 */
Template.workitem.title = function() {
  return "New WorkItem";
}
Template.workItemTitleEditor.events = {
    'keydown textarea' : function(e) {
      $id = $(e.target).closest("#work-item-title-editor").attr('editing-id');
      WorkItems.update($id, {$set : {
        name: e.target.value,
        dirty: true
      }});
      if (e.keyCode == 13 && !e.shiftKey){
        $(e.target).blur();
        e.stopPropagation();
        return;
      }
    },
    'blur textarea' : function(e) {
      $wie = $("#work-item-title-editor");
      $id = $(e.target).closest("#work-item-title-editor").attr('editing-id');
      WorkItems.update($id, {$set : {
        name: $wie.find("textarea").val(),
        dirty: true
      }});
      $wie.find('textarea').val("");
      $wie.hide();
      id = $wie.attr('editing-id');
      $id = $(e.target).closest('#work-item-title-editor').attr('editing-id');
      // add current user to editor of WI
      workboard.userStopEditingItem(id);
    }
};
Template.workitem.events = {
  'click .details' : function (e) {
    id = $(e.currentTarget).closest(".workItem").attr('data-item-id');
    WorkItemDialog.showWiDialog(id);
    // add current user to editor of WI
    workboard.userEditingWorkItem(id);
  },
  'click h4.itemTitle' : function(e) {
    // If we're linking, don't open the editor.
    if (workboard.IS_LINKING) return;

    // Get the position and title element
    $wiEditor = $("#work-item-title-editor");
    $target = $(e.target).closest(".itemTitle");
    pos = $target.offset();

    $wiEditor.css({
      top: pos.top,
      left: pos.left-5,
      width: $target.width(),
      height: $target.height()
    }).show();

    id = $target.closest('[data-item-id]').attr('data-item-id');
    $wiEditor.attr('editing-id', id);
    $wiEditor.find('textarea').val(WorkItems.findOne(id).name).focus().autosize().resize();
    
    // add current user to editor of WI
    workboard.userEditingWorkItem(id);
    e.stopPropagation();
  },
  'click .wi-sync' : function(e) {
    var wiId = $(e.currentTarget).closest(".workItem").attr('data-item-id');
    // TODO @bradens 
    // Session.set('loading','true');
    Meteor.call('synchronizeWorkItem', wiId, defines.noop);
  },
  'click .wiDelete' : function (e) {
    var siId = $(e.currentTarget).closest(".workItem").attr('data-item-id');
    Meteor.call("removeWorkItem", siId);
  },
  'click .linkWI' : function(e) {
    workboard.IS_LINKING = true;
    workboard.currentLineID = $(e.currentTarget).closest(".workItem").attr("data-item-id");
    
    // add current user to editor of WI
    workboard.userEditingWorkItem(workboard.currentLineID);
    e.stopPropagation();
  },
  'click .workItem' : function (e) {
    // Adjust the z-index
    $(this).addClass('top').removeClass('bottom');
    $(this).siblings().removeClass('top').addClass('bottom');
    $(this).css("z-index", workboard.zIndexBuffer++);

    if (workboard.IS_LINKING)
    {
      workboard.IS_LINKING = false;
      // finish the link;
      
      $cId = $(e.currentTarget).closest(".workItem").attr('data-item-id');
      Links.insert({
        repo_id: Session.get("currentRepoId"),
        parentID: workboard.currentLineID,
        childID: $cId
      });

      WorkItems.update(workboard.currentLineID, {$set: {dirty: true}});
      WorkItems.update($cId, {$set: {dirty: true}});
      
      // add current user to editor of WI
      workboard.userStopEditingItem(workboard.currentLineID);
    }
  },
  'mouseover .workItem' : function() {
    $('#wi_'+this._id).draggable({
      containment: '#myCanvas',
      start: function(event, ui) {
        $(this).css("z-index", workboard.zIndexBuffer++);  // TODO @bradens wrap if we reach Number.MAX_VALUE
      }
    });
  }
};
