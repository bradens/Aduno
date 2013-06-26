/**
 * top-nav.js
 * Aduno project (http://aduno.braden.in)
 * @author Braden Simpson (@bradensimpson)
 */
Template.topNav.areServicesConfigured = function () {
    return Accounts.loginServiceConfiguration.find({ service: 'github' }).count() > 0;
};

Template.topNav.getRepoID = function () {
    return Session.get('currentRepoId')
};

Template.topNav.userLogin = function () {
    return Meteor.user()
};

Template.topNav.events = {
    'keyup #repo-search-input': function(e) {
      var value = e.target.value;
      var user = value.substring(0, value.indexOf("/"));
      var repo = value.substring(value.indexOf("/") + 1);
      
      if (e.keyCode == 13) {
        // load the repo
        if (user && repo) {
          Meteor.call('loadRepo', user, repo, function() {
            var RepoObj = Repos.findOne({name: repo, owner: user});
            Session.set("currentRepo", RepoObj.name);
            Session.set("currentRepoId", RepoObj._id);
            Meteor.call('loadLabels',
                        RepoObj.owner,
                        RepoObj.name,
                        workflow.labelsLoaded);
            Meteor.call('loadIssuesWithLabels',
                        RepoObj.owner,
                        RepoObj.name,
                        [],
                        workflow.issuesLoaded);
            Session.set("STORY_VIEW", true);
          });
        }
      }
    },
    'click li.repo-item' : function(e) {
      var RepoItem = $(e.target).closest("li.repo-item");
      Session.set("currentRepo", RepoItem.attr('data-value'));
      Session.set("currentRepoId", RepoItem.attr('data-repo-id'));
      Session.set("STORY_VIEW", true);
      Meteor.call("loadStories", Session.get("currentRepoId"));
      Meteor.call('loadLabels',
                  RepoItem.attr('data-repo-owner'),
                  RepoItem.attr('data-value'),
                  workflow.labelsLoaded);
      Meteor.call('loadIssuesWithLabels', 
                  RepoItem.attr('data-repo-owner'), 
                  RepoItem.attr('data-value'),
                  [],
                  workflow.issuesLoaded);
      Session.set("STORY_VIEW", true);
    },
    'click li a.logoutButton': function(){
      Meteor.logout(function() {
        window.location.href = "/";
      });
    },
    'click ul a#aduno-logo': function() {
      window.location.href = "/";
    }
}
Template.topNav.people = function() {
  return Meteor.users.find({
    _id : {
      $ne: ""
    },
    idle : false
  }, {
    sort: {
      _id : 1
    }
  });
};

Template.topNav.userCount = function() {
  return Meteor.users.find({
    idle: false
  }).count();
}

Template.topNav.otherUsersColor = function() {
  if (Meteor.users.find({
    idle: false
  }).count() > 1) {
    return "#e74c3c";
  } else {
    return "#f3f3f3"
  }
}

Template.topNav.currentRepoName = function() {
  if (Session.get("currentRepo"))
    return Session.get("currentRepo");
  else
    return "Choose a Repo";
};

Template.topNav.currentRepos = function() {
  if (!Meteor.user())
    return [];
  return Repos.find({
    user_ids: Meteor.user()._id
  });
};