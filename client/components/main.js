/**
 * main.js
 * Aduno project (http://aduno.meteor.com)
 * @author Braden Simpson (@bradensimpson)
 * 
 * Main methods for the template.
 */
Template.main.events = {
	'click #newWorkItem' : function () {
		workboard.createNewWorkItem();
	},
	
	'keyup #usernameInput' : function (e) {
		var name;
		name = $('input#usernameInput').val().trim();
		return People.update(Session.get('user_id'), {
			$set: {
			  name: name
			}
		});
	}
};
Template.main.workitems = function() {
	return WorkItems.find({
		name: {
			$ne: ""
		}
	}, { 
		sort: {
			name: 1
		}
	});
};
Template.main.links = function() {
	return Links.find({
		parentID: {
			$ne: ""
		},
		childID: {
			$ne: ""
		}
	}, { 
		sort: {
			linkedID: 1
		}
	});
};
Template.main.people = function() {
	return Meteor.users.find({
		_id : {
			$ne: ""
		}
	}, {
		sort: {
			name : 1
		}
	});
};
Template.person.get_new_badge = function() {
	return randomLabel();
}
