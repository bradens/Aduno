/**
 * client-init.js
 * Aduno project (http://aduno.meteor.com)
 * @author Braden Simpson (@bradensimpson)
 * 
 * Initialization for all client side code.
 */
Meteor.startup(function() {
//  Session.set('loginCallback', true);
  function clientKeepalive() {  
    if (Meteor.user()) {
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
  });
});
