Template.NotificationDropdownItem.getDate = function() {
  return new Date(this.created).toDateString();
}
Template.NotificationDropdownItem.getUnread = function() {
  return (this.unread ? "unread" : "");
}
Template.NotificationDropdownItem.repo = function() {
  return Repos.findOne(this.repo_id).name;
}
Template.NotificationDropdownItem.getType = function() {
  switch(this.type) {
    case defines.NOTIFICATION_TYPES.CHAT_MENTION:
      var frag = Meteor.render(Template.NotificationTitleMention({
        source: this.sourceId,
        fromUser: Meteor.users.findOne(this.fromId),
        repo: Repos.findOne(this.repo_id)
      }));
      return frag.firstElementChild.innerHTML;
  }
}
Template.NotificationDropdownItem.events = {
  'click #mark-as-read': function(e, t) {
    Notifications.update(t.data._id, {$set: {unread: false}});
  }
}

Template.NotificationTitleMention.events ={
  'click a.goto-source': function(e, t) {
    alert("TODO, Open the source of the notification, sourceId: " + t.data.sourceId);
  }
}
