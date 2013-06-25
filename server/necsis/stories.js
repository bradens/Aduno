/**
 * stories.js
 * Aduno project (http://aduno.braden.in)
 * @author Braden Simpson (@bradensimpson)
 * 
 * Define the methods used for server processing here.
 */
var Fiber = Npm.require('fibers');
Meteor.methods({
	'toggleStory' : function(storyId) {
		if (Stories.findOne(storyId).hidden)
			Stories.update(storyId, {$set : {hidden: false}});
		else 
			Stories.update(storyId, {$set : {hidden: true}});
	},
	'hideStory' : function(storyId) {
		Stories.update(storyId, {$set: {hidden: true}});
	},
	'showStory' : function(storyId) {
		Stories.update(storyId, {$set: {hidden: false}});
	}
});