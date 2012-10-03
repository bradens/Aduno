/**
 * client-init.js
 * Aduno project (http://aduno.meteor.com)
 * @author Braden Simpson (@bradensimpson)
 * 
 * Initialization for all client side code.
 */
Meteor.startup(function() {
  Session.set("user_id", null);
  function clientKeepalive() {  
    if (Meteor.user()) {
      if (workflow && !workflow.IS_LOGGED_IN && !Meteor.user().loading)
        workflow.loggedIn();
      Meteor.call('keepalive', Meteor.user()._id);
    }
  }
  // Hack to make a keepalive as soon as meteor connects
  $(window).load(function() {
    clientKeepalive();
  });
  
  Meteor.setInterval(clientKeepalive, 1*1000);
  Meteor.autosubscribe(function() {
    Meteor.subscribe('workitems');
    Meteor.subscribe('users');
    Meteor.subscribe('links');
    Meteor.subscribe('labels', Session.get("currentRepoId"));
    Meteor.subscribe('repos', Session.get("user_id"));
  });
});
