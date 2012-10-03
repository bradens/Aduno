/**
 * top-nav.js
 * Aduno project (http://aduno.meteor.com)
 * @author Braden Simpson (@bradensimpson)
 */

Template.topNav.events = {
    'click li.repo-item' : function(e) {
      var RepoItem = $(e.target).closest("li.repo-item");
      Session.set("currentRepo", RepoItem.attr('data-value'));
      Session.set("currentRepoId", RepoItem.attr('data-repo-id'));
      Meteor.call('loadLabels',
                  RepoItem.attr('data-repo-owner'),
                  RepoItem.attr('data-value'),
                  workflow.labelsLoaded);
      Meteor.call('loadIssues', 
                  RepoItem.attr('data-repo-owner'), 
                  RepoItem.attr('data-value'),
                  workflow.issuesLoaded);
    }
}
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

Template.topNav.currentRepoName = function() {
  if (Session.get("currentRepo"))
    return Session.get("currentRepo");
  else
    return "Current Repo";
};

Template.topNav.currentRepos = function() {
  if (!Meteor.user())
    return [];
  return Repos.find({
    user_ids: Meteor.user()._id
  });
};