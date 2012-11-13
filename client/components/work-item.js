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
    'keyup textarea' : function(e) {
      if (e.keyCode == 13){
        $(e.target).blur();
        e.stopPropagation();
        return;
      }
      $id = $(e.target).closest('#work-item-title-editor').attr('editing-id');
      WorkItems.update($id, {$set : {
        name: e.target.value,
        dirty: true
      }});
    },
    'blur textarea' : function(e) {
      $wie = $("#work-item-title-editor");
      $wie.find('textarea').val("");
      $wie.fadeOut('fast');
      id = $wie.attr('editing-id');
      // add current user to editor of WI
      workboard.userStopEditingItem(id);
    }
}
Template.workItemDescriptionEditor.events = {
    'keyup textarea' : function(e) {
      if (e.keyCode == 13){
        $(e.target).blur();
        e.stopPropagation();
        return;
      }
      $id = $(e.target).closest("#work-item-description-editor").attr('editing-id');
      WorkItems.update($id, {$set : {
        description: e.target.value,
        dirty: true
      }});
    },
    'blur textarea' : function(e) {
      $wie = $("#work-item-description-editor");
      $wie.find('textarea').val("");
      $wie.fadeOut('fast');
      id = $wie.attr("editing-id");
      // add current user to editor of WI
      workboard.userStopEditingItem(id);
      
    }
}
Template.workitem.events = {
  'click .details' : function (e) {
    id = $(e.currentTarget).closest(".workItem").attr('data-wi-id');
    WorkItemDialog.showWiDialog(id);
    // add current user to editor of WI
    workboard.userEditingItem(id);
  },
  'click h4.workItemTitle' : function(e) {
    if (workboard.IS_LINKING) return;
    $wiEditor = $("#work-item-title-editor");
    pos = $(e.target).offset();
    pos.top = pos.top-10;
    pos.left = pos.left-10;
    $wiEditor.css({
      top: pos.top,
      left: pos.left
    }).fadeIn('fast');
    id = $(e.target).closest('[data-wi-id]').attr('data-wi-id');
    $wiEditor.attr('editing-id', id);
    $wiEditor.find('textarea').val(e.target.innerHTML).focus();
    
    // add current user to editor of WI
    workboard.userEditingItem(id);
    e.stopPropagation();
  },
  'click .description' : function(e) {
    if (workboard.IS_LINKING) return;
    $wiEditor = $("#work-item-description-editor");
    pos = $(e.target).offset();
    pos.top = pos.top-10; 
    pos.left = pos.left-10;
    $wiEditor.css({
      top: pos.top,
      left: pos.left
    }).fadeIn('fast');
    id = $(e.target).closest('[data-wi-id]').attr('data-wi-id');
    $wiEditor.attr('editing-id', id);
    $wiEditor.find('textarea').val(e.target.innerHTML).focus();
    
    // add current user to editor of WI
    workboard.userEditingItem(id);
    e.stopPropagation();
  },
  'click .wi-sync' : function(e) {
    var wiId = $(e.currentTarget).closest(".workItem").attr('data-wi-id');
    Meteor.call('synchronizeWorkItem', wiId);
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
    
    // add current user to editor of WI
    workboard.userEditingItem(workboard.currentLineID);
    e.stopPropagation();
  },
  'click .workItem' : function (e) {
    
    // Adjust the z-index
    $(this).addClass('top').removeClass('bottom');
    $(this).siblings().removeClass('top').addClass('bottom');
    $(this).css("z-index", workboard.zIndexBuffer++);

    if (workboard.is_Linking)
    {
      workboard.is_Linking = false;
      // finish the link;
      
      $cId = $(e.currentTarget).closest(".workItem").attr('data-wi-id');
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
  'keyup .workItemTitle' : function(e) {
    console.log(e);
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
Template.workitem.usersEditing = function() {
  return this.usersEditing;
};
Template.workitem.synchronizedClass = function() {
  return (this.dirty ? "btn-warning" : "btn-success");
};