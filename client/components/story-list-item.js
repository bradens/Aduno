Template.storyListItem.events = {
	'click .story-delete' : function(e) {
		$("#warningDialog .warning-dialog-message").html("Deleting this story will also delete all of the tasks inside it.  Are you sure?");
		$("#warningDialog .warning-dialog-ok").html("Delete Story");
    $("#warningDialog").attr('current-story-id', $(e.target).closest('[data-story-id]').attr('data-story-id')).modal();
    e.stopPropagation();
	},
	'click .story-list-item' : function(e) {
		Meteor.call("toggleStory", this._id);
	}
}
Template.tabStories.events = {
	'click a.dangling-stories-btn' : function(e) {
		Session.set("STORY_VIEW", false);
		Session.set("WORKITEM_VIEW", true);
		Session.set("currentStoryId", defines.DANGLING_WORKITEMS_STORY_ID);
	}
};
Template.storyListItem.isShown = function() {
	if (!Stories.findOne(this._id).hidden)
		return "active";
	else 
			return "";
};
Template.tabStories.getDanglingStoryBtnId = function() { 
	return defines.SHOW_DANGLING_WORKITEMS_BTN_ID;
};
Template.tabStories.stories = function() { 
	return Stories.find({
		repo_id: Session.get("currentRepoId")
	});
};
Template.tabStories.getStoryTaskCount = function() {
	return WorkItems.find({story_id: this._id}).count();
};
