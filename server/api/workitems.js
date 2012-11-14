/**
 * methods.js
 * Aduno project (http://aduno.meteor.com)
 * @author Braden Simpson (@bradensimpson)
 * 
 * Define the methods used for server processing here.
 */

Meteor.methods({
	synchronizeWorkItem: function(workItemId) {
    console.log("\nuserId : " + this.userId, "\nworkItemId : " + workItemId);
    item = WorkItems.findOne(workItemId);
    username = Meteor.users.findOne(this.userId).services.github.username;
    reponame = Repos.findOne(item.repo_id).name;

    // TODO @bradens need to embed the links into the workitems

    assigneeName = null;
    if (item.assignee)
      assigneeName = item.assignee.login;
    labels = [];
    // For the new items 
    _.each(item.labels, function(aLabel) {
      if (!aLabel) {
        return;
      }
      labels.push(aLabel.label.name);
    });

    if (item.newItem) {
      // The workItem doesn't exist on github
      github.issues.create({
        user: username, 
        repo: reponame,
        title: item.name, 
        body: item.description,
        assignee: assigneeName,
        labels: labels
      }, function(err, res) {
        console.log("Error when synchronizing work items\n" + err);
        Fiber(function() {
          WorkItems.update(workItemId, {$set: { unsync: false, dirty: false }});
        }).run()
      });
    }
    else {
      // edit it
      github.issues.edit({
        user: username,
        repo: reponame,
        number: item.number,
        title: item.name,
        body: item.description,
        assignee: assigneeName,
        labels: labels
      }, function(err, res) {
        console.log("Error when synchronizing work items\n" + err);
        Fiber(function() {
          WorkItems.update(workItemId, {$set: { unsync: false, dirty: false }});
        }).run()
      });
    }
  },
  // Updates github with the workitems from Aduno.
  updateWorkItems: function(username, reponame, repoId) {
    newItems = WorkItems.find({newItem: true, repo_id: repoId}).fetch();
    dirtyItems = WorkItems.find({dirty: true, repo_id: repoId}).fetch();
    // First add the new work items.
    _.each(newItems, function(item) {
      assigneeName = null;
      if (item.assignee)
        assigneeName = item.assignee.login;
      labels = [];
      // For the new items 
      _.each(item.labels, function(aLabel) {
        labels.push(aLabel.label.name);
      });
      github.issues.create({
        user: username, 
        repo: reponame,
        title: item.name,
        body: item.description,
        assignee: assigneeName,
        labels: labels
      }, function(err, res) {
        console.log("Error when updating new work items\n" + err);
      });
    });
    
    // TODO @bradens  -- is this a race cond? done like this for efficiency
    // Now clear off the new Items.
    WorkItems.update({repo_id: repoId, newItem: true}, {$set: {newItem: false}});
    
    // Now the dirty (modified) items.
    _.each(dirtyItems, function(item) {
      labels = [];
      _.each(item.labels, function(aLabel) {
        labels.push(aLabel.label.name);
      });
      console.log(item);
      assigneeName = null;
      if (item.assignee)
        assigneeName = item.assignee.login;
      github.issues.edit({
        user: username, 
        repo: reponame, 
        title: item.name,
        body: item.description,
        number: item.number,
        assignee: assigneeName,
        labels: labels
      }, function(err, res) {
        console.log(err);
      });
    });
    
    WorkItems.update({repo_id: repoId, dirty: true}, {$set: {dirty: false}});
  },
  //Load all of the issues for a specific repo
  // Once again, github information takes precedence.
  loadIssuesWithLabels: function(username, reponame, labels) {
    //TODO @bradens
    if (!labels || labels.length == 0) {
      labels = null;
    }
    github.issues.repoIssues({
      user: username,
      repo: reponame,
      labels: labels
    }, function(err, res) {
      if (err) { 
        console.log(err);
        return;
      }
      else {
        Fiber(function() {
          Meteor.call('loadedIssues', username, reponame, res, labels);
        }).run();
      }
    });
  },
  loadedIssues: function(username, reponame, result, tag) {
    Fiber(function() {
      var repoObj = Repos.findOne({
        owner : username, 
        name : reponame
      });
      _.each(result, function(item) {
        // TODO @braden insert some issues
        var wi = WorkItems.findOne({
          number: item.number,
          repo_id: repoObj._id
        });
        if (!wi) {
          // TODO @braden 
          // Somehow position these in a way that makes sense.  
          // Currently going to place them in a random position once we 
          // get back to the client.  
          // It doesn't exist in the aduno repo
          var labels = [];
          _.each(item.labels, function(item) {
            var label = Labels.findOne({'label.name': item.name});
            labels.push(label);
          });
          WorkItems.insert({
            name : item.title,
            number: item.number,
            repo_id: repoObj._id,
            labels : labels,
            description: item.body,
            assignee: item.assignee,
            milestone: item.milestone,
            comments : item.comments,
            top: -1,
            left: -1
          });
        }
        else {
          // There is a work item here already
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
              var label = Labels.findOne({'label.name': item.name});
              labels.push(label);
            });
            WorkItems.update(wi._id, {
              $set: {
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
      });
    }).run();
  }
});
