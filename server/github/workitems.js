/**
 * workitems.js
 * Aduno project (http://aduno.braden.in)
 * @author Braden Simpson (@bradensimpson)
 * 
 * Define the methods used for server processing here.
 */
var Fiber = Npm.require('fibers');
Meteor.methods({
  openWorkItem: function(workItemId) {
    WorkItems.update(workItemId, {$set: {dirty: true, state: defines.WI_OPEN_STATE}});
  },
  closeWorkItem: function(workItemId) {
    WorkItems.update(workItemId, {$set: {dirty: true, state: defines.WI_CLOSED_STATE}});
  },
  extractLinksFromWorkItem: function(workItemId) {
    extractLinks = function(item) {
      linkRegexp = /#\S*/g;
      links = []
      if ((desclinks = item.description.match(linkRegexp)) !== null)
        links = links.concat(desclinks);
      if ((namelinks = item.name.match(linkRegexp)) !== null)
        links = links.concat(namelinks);    
      return links
    }
    createLinks = function(links, item) {
      _.each(links, function(link) {

        wi = WorkItems.findOne({repo_id: item.repo_id, number: parseInt(link.substr(1))})
        if (wi === undefined || !wi) return;
        parms = {
          repo_id: item.repo_id,
          parentID: item._id,
          childID: wi._id 
        }
        if (Links.find(parms).count() === 0) {
          Links.insert(parms)
        }
      });
    }
    item = WorkItems.findOne(workItemId);
    createLinks(extractLinks(item), item);
  },
  // TODO @bradens need to embed the links into the workitems
  // SynchronizeWorkitem
  synchronizeWorkItem: function(workItemId) {
    Meteor.call("loadAuth");    
    item = WorkItems.findOne(workItemId);
    repoObj = Repos.findOne(item.repo_id);
    username = repoObj.owner;
    reponame = repoObj.name;

    // construct the label list
    labels = [];
    _.each(item.labels, function(aLabel) {
      if (!aLabel) {
        return;
      }
      labels.push(aLabel.name);
    });

    Meteor.call("extractLinksFromWorkItem", workItemId);

    parms = {
      user: username,
      repo: reponame,
      title: item.name,
      body: item.description,
      labels: labels,
      state: item.state
    };

    if (item.story_id && item.story_id !== defines.DANGLING_WORKITEMS_STORY_ID) {
      var storyItem = Stories.findOne(item.story_id);
      if (storyItem.number === undefined || storyItem.number === null) {
        // sync the story first.
        Meteor.call("syncStory", storyItem._id);
      }
      parms.milestone = storyItem.number;
    }

    if (!_.isUndefined(item.assignee) && !_.isNull(item.assignee))
      parms.assignee = item.assignee.services.github.username;
    
    if (!item.number) {
      // The workItem doesn't exist on github
      github.issues.create(parms, function(err, res) {
        if (err) {
          log("Error when synchronizing work items\n" + err);
        }
        else {
          Fiber(function() {
            WorkItems.update(workItemId, {$set: {number: res.number, dirty: false }});
          }).run();
        }      
      });
    }
    else {
      // Update it
      parms.number = item.number;
      github.issues.edit(parms, function(err, res) {
        if (err) {
          log("Error when synchronizing work items\n" + err);
        }
        else {
          Fiber(function() {
            WorkItems.update(workItemId, {$set: {dirty: false }});
          }).run();
        }
      });
    }
  },
  // Updates github with the workitems from Aduno.
  updateWorkItems: function(owner, reponame, repoId) {
    newItems = WorkItems.find({number: null, repo_id: repoId}).fetch();
    // First add the new work items.  
    _.each(newItems, function(item) {
      
      labels = [];
      // For the new items 
      _.each(item.labels, function(aLabel) {
        labels.push(aLabel.name);
      });

      parms = {
        user: owner, 
        repo: reponame,
        title: item.name,
        body: item.description,
        labels: labels,
        state: item.state
      }

      if (item.story_id && item.story_id !== defines.DANGLING_WORKITEMS_STORY_ID) {
        var storyItem = Stories.findOne(item.story_id);
        if (storyItem.number === undefined || storyItem.number === null) {
          // sync the story first.
          Meteor.call("syncStory", storyItem._id);
        }
        parms.milestone = storyItem.number;
      }

      if (!_.isUndefined(item.assignee) && !_.isNull(item.assignee))
        parms.assignee = item.assignee.services.github.username;

      Meteor.call("loadAuth");
      github.issues.create(parms, function(err, res) {
        if (err){
          log("Error when updating new work items\n" + err);
        }
        else { 
          Fiber(function() {
            WorkItems.update(item._id, {$set: {number: res.number, dirty: false }});
          }).run();
        }
      });
    });
    
    dirtyItems = WorkItems.find({dirty: true, repo_id: repoId}).fetch();
    // Now the dirty (modified) items.
    _.each(dirtyItems, function(item) {
      labels = [];
      _.each(item.labels, function(aLabel) {
        labels.push(aLabel.name);
      });

      log(item.newItem);

      parms = {
        user: owner, 
        repo: reponame,
        title: item.name,
        number: item.number,
        body: item.description,
        labels: labels,
        state: item.state
      }

      if (item.story_id && item.story_id !== defines.DANGLING_WORKITEMS_STORY_ID) {
        var storyItem = Stories.findOne(item.story_id);
        if (storyItem.number === undefined || storyItem.number === null) {
          // sync the story first.
          Meteor.call("syncStory", storyItem._id);
        }
        parms.milestone = storyItem.number;
      } 

      if (!_.isUndefined(item.assignee) && !_.isNull(item.assignee))
        parms.assignee = item.assignee.services.github.username;

      Meteor.call('loadAuth');
      github.issues.edit(parms, function(err, res) {
        if (err) {
          log(err);
        }
        else {
          Fiber(function() {
            WorkItems.update(item._id, {$set: {dirty: false }});
          }).run();
        }
      });
    });    
  },
  // Load all of the issues for a specific repo
  // Once again, github information takes precedence.
  loadIssuesWithLabels: function(username, reponame, labels) {
    parms = { 
      user: username, 
      repo: reponame 
    };
    if (labels && labels.length != 0) {
      parms.labels = labels;
    }
    github.issues.repoIssues(parms, function(err, res) {
      if (err) { 
        log(err);
      }
      else {
        Fiber(function() {
          Meteor.call('loadedIssues', username, reponame, res, labels);
        }).run();
      }
    });
  },

  // Called by @method loadIssuesWithLabels
  loadedIssues: function(username, reponame, result, tag) {
    Fiber(function() {
      var repoObj = Repos.findOne({
        owner : username, 
        name : reponame
      });

      _.each(result, function(item) {
        var wi = WorkItems.findOne({
          number: item.number,
          repo_id: repoObj._id
        });
        var workItemId;
        if (!wi) {
          // TODO @braden 
          // Somehow position these in a way that makes sense.  
          // Currently going to place them in a random position once we 
          // get back to the client.  
          // It doesn't exist in the aduno repo
          var labels = [];
          _.each(item.labels, function(item) {
            var label = Labels.findOne({name: item.name});
            labels.push(label);
          });
          
          var assignee = null, milestone = null;
          if (!item.assignee) {
            assignee = null;
          }
          else {
            assignee = item.assignee.name;
          }
          
          if (item.milestone) {
            milestone = Stories.findOne({number: item.milestone.number, repo_id: repoObj._id});
            if (!milestone) {
              // This means the milestone not yet in our db
              Meteor.call('loadStories', repoObj._id);
              milestone = Stories.findOne({number: item.milestone.number, repo_id: repoObj._id});
            }
            else {
              milestone = milestone._id;
            }
          }
          else {
            milestone = defines.DANGLING_WORKITEMS_STORY_ID;
          }
          workItemId = WorkItems.insert({
            state: item.state,
            story_id: milestone,
            name : item.title,
            number: item.number,
            repo_id: repoObj._id,
            labels : labels,
            description: item.body,
            assignee: assignee,
            comments : item.comments,
            top: -1,
            left: -1
          });
        }
        else {
          // There is a work item here already
          workItemId = wi._id;
          if (wi.dirty) {
            // it's dirty then it means someone on github updated theirs without us getting a pull.
            // Need to figure out a merge strategy, but in the mean time keep ours.  
            WorkItems.update(wi._id, {
              $set : {
                unsync: true
              }
            });
          }
          else {
            //. It's not dirty, but different than ours.  Update it.
            var labels = [];
            _.each(item.labels, function(item) {
              var label = Labels.findOne({name: item.name});
              labels.push(label);
            });
            // Need to user our assignee object instead of the github one.
            if (item.assignee && item.assignee.login){
              item.assignee = Meteor.users.findOne({'services.github.username': item.assignee.login});
            }
            WorkItems.update(wi._id, {
              $set: {
                state: item.state,
                name: item.title, 
                number: item.number,
                repo_id: repoObj._id,
                labels : labels,
                description: item.body,
                assignee: item.assignee,
                milestone: item.milestone,
                comments : item.comments
              }
            });
          }
        }
        Meteor.call("extractLinksFromWorkItem", workItemId);
      });
    }).run();
  }
});
