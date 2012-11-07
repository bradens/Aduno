/**
 * top-nav.js
 * Aduno project (http://aduno.meteor.com)
 * @author Braden Simpson (@bradensimpson)
 */
Template.topNav.areServicesConfigured = function () {
    return Accounts.loginServicesConfigured()
};

Template.topNav.getrepoID = function () {
    return Session.get('currentRepoId')
};

Template.topNav.userLogin = function () {
    return Meteor.user()
};

Template.topNav.events = {
    'click li.repo-item' : function(e) {
      var RepoItem = $(e.target).closest("li.repo-item");
      Session.set("currentRepo", RepoItem.attr('data-value'));
      Session.set("currentRepoId", RepoItem.attr('data-repo-id'));
      Meteor.call('loadLabels',
                  RepoItem.attr('data-repo-owner'),
                  RepoItem.attr('data-value'),
                  workflow.labelsLoaded);
      Meteor.call('loadIssuesWithLabels', 
                  RepoItem.attr('data-repo-owner'), 
                  RepoItem.attr('data-value'),
                  [],
                  workflow.issuesLoaded);
    },
    'click li a.loginButton': function() {
      Meteor.loginWithGithub();
    },
    'click li a.logoutButton': function(){
      Meteor.logout();
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
    return "Choose a Repo";
};

Template.topNav.isUserLoggedIn = function() {
  return Meteor.userLoaded();
};

Template.topNav.isUserLoading = function() { 
  return Meteor.user() && !Meteor.userLoaded();
};

Template.topNav.currentRepos = function() {
  if (!Meteor.user())
    return [];
  return Repos.find({
    user_ids: Meteor.user()._id
  });
};