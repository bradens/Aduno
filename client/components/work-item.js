/**
 * work-item.js
 * Aduno project (http://aduno.braden.in)
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
    'keydown textarea' : function(e) {
      $id = $(e.target).closest("#work-item-title-editor").attr('editing-id');
      WorkItems.update($id, {$set : {
        name: e.target.value,
        dirty: true
      }});
      if (e.keyCode == 13){
        $(e.target).blur();
        e.stopPropagation();
        return;
      }
    },
    'blur textarea' : function(e) {
      $wie = $("#work-item-title-editor");
      $wie.find('textarea').val("");
      $wie.hide();
      id = $wie.attr('editing-id');
      $id = $(e.target).closest('#work-item-title-editor').attr('editing-id');
      // add current user to editor of WI
      workboard.userStopEditingItem(id);
    }
}
Template.workItemDescriptionEditor.events = {
    'keydown textarea' : function(e) {
      $id = $(e.target).closest("#work-item-description-editor").attr('editing-id');
      WorkItems.update($id, {$set : {
        description: e.target.value,
        dirty: true
      }});
      if (e.keyCode == 13 && !e.shiftKey){
        $(e.target).blur();
        e.stopPropagation();
        return;
      }
    },
    'blur textarea' : function(e) {
      $wie = $("#work-item-description-editor");
      $wie.find('textarea').val("");
      $wie.fadeOut('fast');
      id = $wie.attr("editing-id");
      Session.set("OPEN_WI_ID", null);
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

    // Get the position and title element
    $wiEditor = $("#work-item-title-editor");
    $target = $(e.target);
    pos = $target.offset();

    $wiEditor.css({
      top: pos.top,
      left: pos.left-5,
      width: $target.width(),
      height: $target.height()
    }).show();

    id = $target.closest('[data-wi-id]').attr('data-wi-id');
    $wiEditor.attr('editing-id', id);
    $wiEditor.find('textarea').val(e.target.innerHTML).focus().autosize().resize();
    
    // add current user to editor of WI
    workboard.userEditingItem(id);
    e.stopPropagation();
  },
  'click .description' : function(e) {
    if (workboard.IS_LINKING) return;
    $wiEditor = $("#work-item-description-editor");
    $target = $(e.target);
    pos = $(e.target).offset();

    $wiEditor.css({
      top: pos.top,
      left: pos.left-5,
      width: $target.width(),
      height: $target.height()
    }).show();

    id = $target.closest('[data-wi-id]').attr('data-wi-id');
    $wiEditor.attr('editing-id', id);
    $wiEditor.find('textarea').val(e.target.innerHTML).focus().autosize().resize();
    
    Session.set("OPEN_WI_ID", id);

    // add current user to editor of WI
    workboard.userEditingItem(id);
    e.stopPropagation();
  },
  'click .wi-sync' : function(e) {
    var wiId = $(e.currentTarget).closest(".workItem").attr('data-wi-id');
    // TODO @bradens 
    // Session.set('loading','true');
    Meteor.call('synchronizeWorkItem', wiId);
  },
  'click .wiDelete' : function (e) {
    var wiID = $(e.currentTarget).closest(".workItem").attr('data-wi-id');
    Meteor.call("removeWorkItem", wiID);
  },
  'click .linkWI' : function(e) {
    workboard.IS_LINKING = true;
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

    if (workboard.IS_LINKING)
    {
      workboard.IS_LINKING = false;
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
  'mouseover .workItem' : function() {
    $('#wi_'+this._id).draggable({
      containment: '#myCanvas',
      start: function(event, ui) {
        $(this).css("z-index", workboard.zIndexBuffer++);  // TODO @bradens wrap if we reach Number.MAX_VALUE
      }
    });
  }
};
Template.workitem.isOpen = function() {
  return (this._id == Session.get("OPEN_WI_ID") ? "open" : "");
};
Template.workitem.usersEditing = function() {
  return this.usersEditing;
};
Template.workitem.synchronizedClass = function() {
  return (this.dirty ? "btn-warning" : "btn-success");
};
