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
  
  Handlebars.registerHelper('iter', function(context, options) {
    var fn = options.fn, inverse = options.inverse;
    var ret = "";

    if(context && context.length > 0) {
      for(var i=0, j=context.length; i<j; i++) {
        ret = ret + fn(_.extend({}, context[i], { i: i, iPlus1: i + 1 }));
      }
    } else {
      ret = inverse(this);
    }
    return ret;
  });
  
  WorkItems.find().observe({
    added: function(item) {
        if (item.left == -1 && item.top == -1) {
          // Hacky way to determine if this is a newly added work item.
          // Need to improve this TODO @bradens
          var newPosition = workboard.getNewItemPos();
          Meteor.defer( function() {
            WorkItems.update(item._id, {$set: {top: newPosition.top, left: newPosition.left}});
          });
        }
    }
  });
  
  Meteor.setInterval(clientKeepalive, 1*1000);
  Meteor.autosubscribe(function() {
    Meteor.subscribe('workitems', Session.get("currentRepoId"));
    Meteor.subscribe('users');
    Meteor.subscribe('links', Session.get("currentRepoId"));
    Meteor.subscribe('labels', Session.get("currentRepoId"));
    Meteor.subscribe('repos', Session.get("user_id"));
    Meteor.subscribe('messages', Session.get("currentRepoId"));
  });
});
