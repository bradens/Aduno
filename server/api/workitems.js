/**
 * workitems.js
 * Aduno project (http://aduno.braden.in)
 * @author Braden Simpson (@bradensimpson)
 * 
 * Define the methods used for server processing here.
 */
var Fiber = Npm.require('fibers');

Meteor.methods({
	'removeStoryItem': function(storyItemId) {
		Stories.remove(storyItemId);
		StoryLinks.remove({$or: [{childID: storyItemId}, {parentID: storyItemId}]});
	},
	'removeWorkItem': function(workItemId) {
    // Remove the WorkItem
    WorkItems.remove(workItemId);
    // Remove the Links
    Links.remove({$or : [{childID: workItemId}, {parentID: workItemId}]});
	}
});