/**
 * client-init.js
 * Aduno project (http://aduno.meteor.com)
 * @author Braden Simpson (@bradensimpson)
 * 
 * Initialization for all client side code.
 */
Meteor.startup(function() {
	var user_id;
	user_id = People.insert({
	  name: "",
	  idle: false,
	  badge: randomLabel()
	});
	Session.set('user_id', user_id);

	Meteor.setInterval(function() {
    if (Meteor.status().connected)
    	Meteor.call('keepalive', Session.get('user_id'));
  	}, 20*1000);
	
	Meteor.autosubscribe(function() {
		Meteor.subscribe('workitems');
		Meteor.subscribe('people');
		Meteor.subscribe('links');
	});
});
