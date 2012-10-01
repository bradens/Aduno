/**
 * top-nav.js
 * Aduno project (http://aduno.meteor.com)
 * @author Braden Simpson (@bradensimpson)
 */
Template.topNav.people = function() {
  return Meteor.users.find({
    _id : {
      $ne: ""
    },
    idle : {
      $ne : true
    }
  }, {
    sort: {
      _id : 1
    }
  });
};
Template.topNav.currentRepos = function() {
  if (!Meteor.user())
    return [];
  return Repos.find({
    user_ids: Meteor.user()._id
  });
};