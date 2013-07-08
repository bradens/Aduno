/**
 * stories.js
 * Aduno project (http://aduno.braden.in)
 * @author Braden Simpson (@bradensimpson)
 * 
 * Define the methods which interact with stories here.
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
	},
	// Pull in all the milestones for a repository
	loadStories: function(repoId) {
		Meteor.call('loadAuth');
		log("Loading Stories...\nuserId: " + this.userId + "\nrepoId: " + repoId);

		repoItem = Repos.findOne(repoId);
		username = repoItem.owner;
		reponame = repoItem.name;
		parms = {
			user: username,
			repo: reponame,
			per_page: 100
		}
		github.issues.getAllMilestones(parms, function(err, res) {
			if (err) {
				log("Error getting milestones.\n" + err);
			}
			else { 
				Fiber(function() {
					_.each(res, function(item) {
						story = Stories.findOne({
											repo_id: repoItem._id,
											number: item.number
										});

						if (!story) {
							var creator = null;
							if (item.creator) {
								creator = Meteor.users.findOne({'services.github.username': item.creator.login});
							}
							Stories.insert({
								repo_id: repoItem._id,
								number: item.number,
								name: item.title,
								description: item.description,
								hidden: true,
								creator: creator,
								open_issues: item.open_issues,
								closed_issues: item.closed_issues,
								created_at: item.created_at,
								due_on: item.due_on,
								left: -1,
								top: -1
							});
						}
					})
				}).run();
			}
		});
	},
	syncStory: function(storyId) {
		Meteor.call('loadAuth');
		var storyItem = Stories.findOne(storyId);
		var	repoObj = Repos.findOne(storyItem.repo_id);
		var	username = repoObj.owner,
			reponame = repoObj.name;

		parms = {
			user: username,
			repo: reponame,
			title: storyItem.name,
			description: storyItem.description
		}

		if (storyItem.number) {
			parms.number = storyItem.number;
			github.issues.updateMilestone(parms, function(err, res) {
				if (err) {
					log(err);
					return;
				}
				else {
					Fiber(function() {
						Stories.update(storyId, {$set: {dirty: false}});
					}).run();
				}
			})
		}
		else {
			github.issues.createMilestone(parms, function(err, res) {
				if (err) {
					log(err);
					return;
				}
				else {
					Fiber(function() {
						Stories.update(storyId, {$set: {dirty: false, number: res.number}});
					}).run();
				}
			});
		}
	}
});