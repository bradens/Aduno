Template.chatEntry.events = {
    'keydown input#message': function (e) {
        if(e.keyCode == 13) {
          var val = $('#message').val();
          Messages.insert({
            repo_id: Session.get('currentRepoId'), 
            name:Meteor.user().profile.name, 
            user_id: Meteor.user()._id,
            message: val,
            uniqueName: Meteor.user().uniqueName,
            at: new Date()
          });
          _.each(ParseMentions(val), function(item) {
            var name = item.substr(1);
            if ((user = Meteor.users.findOne({uniqueName: name}))) {
              Notifications.insert({
                type: defines.NOTIFICATION_TYPES.CHAT_MENTION,
                created: Date.now(),
                body: val,
                fromId: Meteor.user()._id,
                toId: user._id,
                unread: true, 
                repo_id: Session.get("currentRepoId")
              })
            }
          });
          $('#message').val('');
        }
    }
};
// This function uses regex to parse out the chunks of text that are 
// used for mentions in the 'twitter' syntax.  I.e. @bradens
var ParseMentions = function(message) {
  return message.match(/@\S+/g);
}
Template.chat.events = {
  'click #chat-header' : function(e) {
    if (Session.get("CHAT_HEADER_CLOSED")) {
      Session.set("CHAT_HEADER_CLOSED", false);
    }
    else {
      Session.set("CHAT_HEADER_CLOSED", true); 
    }
  }
}
Template.chat.getUniqueName = function() {
  if (this.uniqueName)
    return this.uniqueName
  else if (this.fromId)
    return Meteor.users.findOne(this.fromId).uniqueName;
  else
    return "upgrade";
}
Template.chat.isClosed = function() {
  return (Session.get("CHAT_HEADER_CLOSED") ? "chat-closed" : "");
}
Template.chat.messages = function () {
    // fetch array of all the items
    var items = Messages.find({repo_id: Session.get('currentRepoId')}, {sort: {time: -1}}).fetch();
     
    // return only the last 50 items
    return items.slice(-50);
};

Template.chat.rendered = function () {
  if(Session.get('currentRepoId') != null){
    scrollToBottom('chat-content');
  }
}