/**
 * placement.js
 * Aduno project (http://aduno.braden.in)
 * @author Braden Simpson (@bradensimpson)
 * 
 * Place the work-items in a good manner here
 */

Meteor.methods({
	// Method to change the placement of all items in a 
	"placeItems": function(repoId, labelId) {
		var items, graph;
		if (labelId) {
	    items =  WorkItems.find({
	      repo_id: repoId,
	      name: {
	        $ne: ""
	      },
	      'labels._id': labelId
	    }, { 
	      sort: {
	        name: 1
	      }
	    }).fetch();
	  } else {
	    items = WorkItems.find({
	    	repo_id: repoId,
	      name: {
	        $ne: ""
	      },
	    }, { 
	      sort: {	
	        name: 1
	      }
	    }).fetch();
	  }
	  // graph = Springy.Graph();
	}
});	