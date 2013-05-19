/**
 * methods.js
 * Aduno project (http://aduno.braden.in)
 * @author Braden Simpson (@bradensimpson)
 * 
 * Define the methods used for server processing here.
 */
var Fiber = Npm.require('fibers');

Meteor.methods({
	'removeWorkItem': function(workItemId) {
    // Remove the WorkItem
    WorkItems.remove(workItemId);

    // Remove the Links
    Links.remove({childId: workItemId});
    Links.remove({parentId: workItemId});
	}
});