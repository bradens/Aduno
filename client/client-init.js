/**
 * client-init.js
 * Aduno project (http://aduno.meteor.com)
 * @author Braden Simpson (@bradensimpson)
 * 
 * Initialization for all client side code.
 */
Meteor.startup(function() {
  Session.set("user_id", null);
  Session.set("currentLabel", "all");
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
  
  WorkItems.find().observe({
    added: function(item) {
      Meteor.defer(function() {
        if (item.left == -1 && item.top == -1) {
          // Hacky way to determine if this is a newly added work item.
          // Need to improve this TODO @bradens
          var newPosition = workboard.getNewItemPos();
          WorkItems.update(item._id, {$set: {top: newPosition.top, left: newPosition.left}});
        }
      });
    }
  });
  
  Meteor.setInterval(clientKeepalive, 1*1000);
  Meteor.autosubscribe(function() {
    Meteor.subscribe('workitems', Session.get("currentRepoId"));
    Meteor.subscribe('users');
    Meteor.subscribe('links', Session.get("currentRepoId"));
    Meteor.subscribe('labels', Session.get("currentRepoId"));
    Meteor.subscribe('repos', Session.get("user_id"));
  });
});
