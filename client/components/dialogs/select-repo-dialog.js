/**
 * select-repo-dialog.js
 * Aduno project (http://aduno.braden.in)
 * @author Braden Simpson (@bradensimpson)
 * 
 * Initialization for all client side code.
 */
Template.selectRepoDialog.events = {
  'click .repo-grid-item': function(e) {
    var RepoItem = $(e.target).closest("a.repo-grid-item");
    Session.set("currentRepo", RepoItem.attr('data-repo-name'));
    Session.set("currentRepoId", RepoItem.attr('data-repo-id'));
    Session.set("STORY_VIEW", true);
    Meteor.call('loadLabels',
                RepoItem.attr('data-repo-owner'),
                RepoItem.attr('data-repo-name'),
                workflow.labelsLoaded);
    Meteor.call('loadIssuesWithLabels', 
                RepoItem.attr('data-repo-owner'), 
                RepoItem.attr('data-repo-name'),
                [],
                workflow.issuesLoaded);
    $("#select-repo-dialog").modal('hide');
  } 
};
Template.selectRepoDialog.repos = function() {
  if (!Meteor.user())
    return [];  
  return Repos.find({ user_ids: Meteor.user()._id }, {$sort: {name: -1}});
};