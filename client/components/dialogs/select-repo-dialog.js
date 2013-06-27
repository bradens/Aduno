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
    workflow.loadRepository(RepoItem.attr('data-repo-name'),
                            RepoItem.attr('data-repo-id'),
                            RepoItem.attr('data-repo-owner'));
    $("#select-repo-dialog").modal('hide');
  } 
};
Template.selectRepoDialog.repos = function() {
  if (!Meteor.user())
    return [];  
  return Repos.find({ user_ids: Meteor.user()._id }, {$sort: {name: -1}});
};