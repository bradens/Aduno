window.NotificationsController = {
  getTypeTitle: function(not) {
    switch(not.type) {
      case defines.NOTIFICATION_TYPES.CHAT_MENTION:
        var frag = Meteor.render(Template.NotificationTitleMention({
          source: not.sourceId,
          fromUser: Meteor.users.findOne(not.fromId),
          repo: Repos.findOne(not.repo_id)
        }));
        return frag.firstElementChild.innerHTML;
    }
  } 
};