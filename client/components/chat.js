Template.chatEntry.events = {
    'keydown input#message': function (e) {
        if(e.keyCode == 13) {
          Messages.insert({repo_id: Session.get('currentRepoId'), name:Meteor.user().profile.name, message:$('#message').val(), at: new Date()});
          $('#message').val('');
        }
    }
};
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