/**
 * Server code: Using the heartbeat method to check if people are 
 * around.
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
  }
});

// server code: clean up dead clients after 5 seconds
Meteor.setInterval(function () {
  var now = (new Date()).getTime();
  var remove_threshold = now - 20*1000;
  People.find({last_keepalive: {$lt: remove_threshold}}).forEach(function (user) {
    console.log(user);
  });
  
  People.remove({last_keepalive: {$lt: remove_threshold}});
}, 5*1000);