/**
 * client-init.js
 * Aduno project (http://aduno.braden.in)
 * @author Braden Simpson (@bradensimpson)
 * 
 * Initialization for all client side code.
 */
Meteor.startup(function() {
  // Need to wrap out meteor.call function and check if we're doing an async call.
  // If we are then make it show the loading notification and queue up the count.
  Meteor.call = (function(func){
    return function(){
      // If the last argument is a function then we are going to call something async
      // Somewhat hacky, should probably do something better in future.
      if (typeof arguments[arguments.length - 1] === typeof Function) {
        arguments[arguments.length - 1] = (function(cb) {
          return function() {
            cb.apply(this, arguments);
            workflow.loadingCallback();   
          }
        })(arguments[arguments.length-1]);
        workflow.loading();
      }
      func.apply(this, arguments);
    }
  })(Meteor.call)

  Session.set("user_id", null);
  Session.set("currentLabel", "all");

  function clientKeepalive() {  
    if (Meteor.user()) {
      if (workflow && !workflow.IS_LOGGED_IN && !Meteor.user().loading)
        workflow.loggedIn();
      Meteor.call('keepalive', Meteor.user()._id);
    }
  }
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
  
  // Watch for new workitems being added.
  // When found, figure out their approximate position.
  Stories.find().observe({
    added: function(item) {
      if (item.left == -1 && item.top == -1) {
        var newPosition = workboard.getNewItemPos();
        Meteor.defer( function() {
          Stories.update(item._id, {$set: {top: newPosition.top, left: newPosition.left}});
        });
      }
    }
  });
  // WorkItems.find().observeChanges({
  //   changed: function(id, item){
  //     Meteor.call("extractLinksFromWorkItem", id);
  //   }
  // })
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
    Meteor.subscribe('workitems', Session.get("currentStoryId"), Session.get("currentRepoId"));
    Meteor.subscribe('users');
    Meteor.subscribe('notifications');
    Meteor.subscribe('stories', Session.get("currentRepoId"))
    Meteor.subscribe('links', Session.get("currentRepoId"));
    Meteor.subscribe('storylinks', Session.get("currentRepoId"));
    Meteor.subscribe('labels', Session.get("currentRepoId"));
    Meteor.subscribe('repos', Session.get("user_id"));
    Meteor.subscribe('messages', Session.get("currentRepoId"));
  });
});
