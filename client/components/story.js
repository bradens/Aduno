/**
 * story.js
 * Aduno project (http://aduno.braden.in)
 * @author Braden Simpson (@bradensimpson)
 * 
 * Work-item template javascript.  
 */
Template.story.title = function() {
  return "New Story";
};
Template.storyItemTitleEditor.events = {
    'keydown textarea' : function(e) {
      $id = $(e.target).closest("#story-item-title-editor").attr('editing-id');
      Stories.update($id, {$set : {
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
      $wie = $("#story-item-title-editor");
      var id = $wie.attr('editing-id');
      Stories.update(id, {$set : {
        name: $wie.find("textarea").val(),
        dirty: true
      }});
      $wie.find('textarea').val("");
      $wie.hide();
      id = $wie.attr('editing-id');
      // add current user to editor of WI
      workboard.userStopEditingItem(id);
    }
}
Template.story.events = {
  'click .details' : function (e) {
    id = $(e.currentTarget).closest(".workItem").attr('data-item-id');
    // StoryItemDialog.showWiDialog(id);
    // add current user to editor of WI
    workboard.userEditingStoryItem(id);
  },
  'click h4.itemTitle' : function(e) {
    // If we're linking, don't open the editor.
    if (workboard.IS_LINKING) return;

    // Get the position and title element
    $wiEditor = $("#story-item-title-editor");
    $target = $(e.target);
    pos = $target.offset();

    $wiEditor.css({
      top: pos.top,
      left: pos.left-5,
      width: $target.width(),
      height: $target.height()
    }).show();

    id = $target.closest('[data-item-id]').attr('data-item-id');
    $wiEditor.attr('editing-id', id);
    $wiEditor.find('textarea').val(e.target.innerHTML).focus().autosize().resize();
    
    // add current user to editor of WI
    workboard.userEditingStoryItem(id);
    e.stopPropagation();
  },
  'click .wi-sync' : function(e) {
    var sId = $(e.currentTarget).closest(".storyItem").attr('data-item-id');
    Meteor.call('syncStory', sId, workflow.loadingCallback);
  },
  'click .wiDelete' : function (e) {
    var wiID = $(e.currentTarget).closest(".storyItem").attr('data-item-id');
    Meteor.call("removeStoryItem", wiID);
  },
  'click .linkWI' : function(e) {
    workboard.IS_LINKING = true;
    workboard.currentLineID = $(e.currentTarget).closest(".storyItem").attr("data-item-id");
    
    // add current user to editor of WI
    workboard.userEditingStoryItem(workboard.currentLineID);
    e.stopPropagation();
  },
  'click .explore': function(e) {
    Session.set("STORY_VIEW", false);
    Session.set("WORKITEM_VIEW", true);
    Session.set("currentStoryId", $(e.target).closest(".storyItem").attr("data-item-id"));
  },
  'click .storyItem' : function (e) {
    // Adjust the z-index
    $(this).addClass('top').removeClass('bottom');
    $(this).siblings().removeClass('top').addClass('bottom');
    $(this).css("z-index", workboard.zIndexBuffer++);

    if (workboard.IS_LINKING)
    {
      workboard.IS_LINKING = false;
      // finish the link;
      
      $cId = $(e.currentTarget).closest(".storyItem").attr('data-item-id');
      StoryLinks.insert({
        repo_id: Session.get("currentRepoId"),
        parentID: workboard.currentLineID,
        childID: $cId
      });

      Stories.update(workboard.currentLineID, {$set: {dirty: true}});
      Stories.update($cId, {$set: {dirty: true}});
      
      workboard.userStopEditingItem(workboard.currentLineID);
    }
  },
  'mouseover .storyItem' : function() {
    $('#story_'+this._id).draggable({
      containment: '#myCanvas',
      start: function(event, ui) {
        $(this).css("z-index", workboard.zIndexBuffer++);  // TODO @bradens wrap if we reach Number.MAX_VALUE
      }
    });
  }
}
