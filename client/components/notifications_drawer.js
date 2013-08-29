Template.NotificationsDrawer.unread = function() {
  return Notifications.find({unread: true});
}
Template.NotificationsDrawer.events = {
  'click .hide-notifications' : function() {
    var $drawer = $("#notifications-drawer");
    Session.set("VIEWING_NOTIFICATIONS", !!!Session.get("VIEWING_NOTIFICATIONS"));
    $drawer.stop().animate({
      right: parseInt($drawer.css('right'),10) == (-1 * $drawer.outerWidth()) ?
        0 :
        (-1 * $drawer.outerWidth())
    });
  }
}