/**
 * methods.js
 * Aduno project (http://aduno.meteor.com)
 * @author Braden Simpson (@bradensimpson)
 * 
 * Define the methods used for server processing here.
 */
Meteor.methods({
  keepalive: function (user_id) {
  	console.log("running keepalive " + user_id);
    People.update({
    	_id: user_id
    	}, 
    	{ $set: {
    			last_keepalive: (new Date()).getTime(),
    			idle: false
    		}
    	});
  },
  postWorkItemAsIssue: function (wiID)
  {
	  var wi = WorkItems.findOne({_id: wiID});
	  console.log("Posting work item " + wiID);
	  github.issues.create({
			user: "bradens",
			repo: "TestingRepo",
			title: wi.name,
			body: wi.description,
			labels: []
		}, function(err, res) {
			console.log(res);
		});
  },
  auth : function (user_id, username, pwd)
  {
	  github.authenticate({
		  type: "basic",
		  username: username,
		  password: pwd
	  });
	  People.update(user_id, {
		$set: {
		  is_authenticated: true
	  }});
  }
});