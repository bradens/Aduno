/**
 * model.js
 * Aduno project (http://aduno.braden.in)
 * @author Braden Simpson (@bradensimpson)
 * 
 * Define the Collections used, and common client/server
 * code here.
 */
 
this.WorkItems = new Meteor.Collection("workitems");
this.Links = new Meteor.Collection("links");
this.StoryLinks = new Meteor.Collection("storylinks");
this.Repos = new Meteor.Collection("repos");
this.ActiveUsers = new Meteor.Collection("activeusers");
this.Issues = new Meteor.Collection("issues");
this.Labels = new Meteor.Collection("labels");
this.Messages = new Meteor.Collection("messages");
this.Notifications = new Meteor.Collection("notifications");
this.Stories = new Meteor.Collection("stories");

// Publishing our collections
if (Meteor.is_server)
{
    Meteor.publish("notifications", function(userId) {
      return Notifications.find({
        $query: {user_id: userId},
        $sort: {created: 1},
        $limit: 10
      });
    });
    Meteor.publish('workitems', function(storyId, repoId) {
      return WorkItems.find({
        story_id: storyId,
        repo_id: repoId
      });
    });
    Meteor.publish('stories', function(repoId) {
      return Stories.find({
        repo_id: repoId
      });
    })
    Meteor.publish('links', function(repoId) {
      return Links.find({
        repo_id: repoId
      });
    });
    Meteor.publish("storylinks", function(repoId) {
      return StoryLinks.find({
        repo_id: repoId
      });
    });
    Meteor.publish('labels', function (repoId) {
      return Labels.find({
        repo_id: repoId
      });
    });
    Meteor.publish('users', function() {
      return Meteor.users.find({}, {fields: {
        'profile.name': 1,
        'uniqueName': 1,
        'username': 1,
        'services.github.username': 1,
        'idle': 1,
        'badge' : 1
      }});
    });
    Meteor.publish('repos', function () {
      return Repos.find({
        privateTo: {
          $in: [null, this.userId]
        }},
        { sort :{
          name: 1
        }}
      );
    });
    Meteor.publish('messages', function (repoId) {
      return Messages.find({
        repo_id: repoId
      });
    });
    
}
