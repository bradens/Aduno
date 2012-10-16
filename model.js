/**
 * model.js
 * Aduno project (http://aduno.meteor.com)
 * @author Braden Simpson (@bradensimpson)
 * 
 * Define the Collections used, and common client/server
 * code here.
 */
this.WorkItems = new Meteor.Collection("workitems");
this.Links = new Meteor.Collection("links");
this.Repos = new Meteor.Collection("repos");
this.ActiveUsers = new Meteor.Collection("activeusers");
this.Issues = new Meteor.Collection("issues");
this.Labels = new Meteor.Collection("labels");
this.Messages = new Meteor.Collection("messages");

// Publishing our collections
if (Meteor.is_server)
{
    Meteor.publish('workitems', function(repoId) {
      return WorkItems.find({
        repo_id: repoId
      });
    });
    Meteor.publish('links', function(repoId) {
      return Links.find({
        repo_id: repoId
      });
    });
    Meteor.publish('issues', function () {
      return Issues.find({});
    });
    Meteor.publish('labels', function (repoId) {
      return Labels.find({
        repo_id: repoId
      });
    });
    Meteor.publish('users', function() {
      return Meteor.users.find({_id: this.userId}, {fields: {
        'profile.name': 1,
        'services.github.username': 1
      }});
    });
    Meteor.publish('repos', function () {
      return Repos.find({
        privateTo: {
          $in: [null, this.userId()]
        }
      });
    });
    Meteor.publish('messages', function (repoId) {
      return Messages.find({
        repo_id: repoId
      });
    });
}