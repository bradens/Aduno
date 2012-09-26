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

// Publishing our collections
if (Meteor.is_server)
{
    Meteor.publish('workitems', function() {
      return WorkItems.find({});
    });
    Meteor.publish('users', function() {
      return Meteor.users.find({});
    });
    Meteor.publish('links', function() {
      return Links.find({});
    });
}