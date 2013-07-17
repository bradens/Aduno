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
		var items, links, graph;
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
	  links = [];
	  var graph = new Springy.Graph();
	  _.each(items, function(item) {
	  	graph.newNode({label: item._id});
	  	links = links.concat(Links.find({parentID: item._id}).fetch());
	  });
		_.each(links, function(link) {
			graph.newEdge(link.childID, link.parentID);
		});
		var layout = new Springy.Layout.ForceDirected(
		  graph,
		  400.0, // Spring stiffness
		  400.0, // Node repulsion
		  0.5 // Damping
		);
		var renderer = new Springy.Renderer(
		  layout,
		  function clear() {
		    // code to clear screen
		  },
		  function drawEdge(edge, p1, p2) {
		    // draw an edge
		  },
		  function drawNode(node, p) {
		    // draw a node
		    console.log(node);
		    
		    console.log(p);
		  }
		);
		renderer.start();
	  console.log(graph);
	}
});	