/**
 * methods.js
 * Aduno project (http://aduno.meteor.com)
 * @author Braden Simpson (@bradensimpson)
 * 
 * Define the methods used for server processing here.
 */

Meteor.methods({
	synchronizeWorkItem: function(workItemId) {
    Meteor.call("loadAuth");
    console.log("\nuserId : " + this.userId, "\nworkItemId : " + workItemId);
    item = WorkItems.findOne(workItemId);
    repoObj = Repos.findOne(item.repo_id);
    username = repoObj.owner;
    reponame = repoObj.name;

    // TODO @bradens need to embed the links into the workitems

    assigneeName = "none";
    if (item.assignee)
      assigneeName = item.assignee.services.github.username;
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
        if (err) {
          console.log("Error when synchronizing work items\n" + err);
        }
        else {
          Fiber(function() {
            WorkItems.update(workItemId, {$set: { newItem: false, unsync: false, number: res.number, dirty: false }});
          }).run();
        }      
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
        if (err) {
          console.log("Error when synchronizing work items\n" + err);
        }
        else {
          Fiber(function() {
            WorkItems.update(workItemId, {$set: { unsync: false, dirty: false }});
          }).run();
        }
      });
    }
  },
  // Updates github with the workitems from Aduno.
  updateWorkItems: function(owner, reponame, repoId) {
    newItems = WorkItems.find({newItem: true, repo_id: repoId}).fetch();
    dirtyItems = WorkItems.find({dirty: true, repo_id: repoId}).fetch();
    // First add the new work items.
    _.each(newItems, function(item) {
      assigneeName = "none";
      if (item.assignee)
        assigneeName = item.assignee.services.github.username;
      labels = [];
      // For the new items 
      _.each(item.labels, function(aLabel) {
        labels.push(aLabel.label.name);
      });
      Meteor.call("loadAuth");
      github.issues.create({
        user: owner, 
        repo: reponame,
        title: item.name,
        body: item.description,
        assignee: assigneeName,
        labels: labels
      }, function(err, res) {
        if (err){
          console.log("Error when updating new work items\n" + err);
        }
        else { 
          Fiber(function() {
            WorkItems.update(item._id, {$set: { newItem: false, unsync: false, number: res.number, dirty: false }});
          }).run();
        }
      });
    });
    
    // Now the dirty (modified) items.
    _.each(dirtyItems, function(item) {
      labels = [];
      _.each(item.labels, function(aLabel) {
        labels.push(aLabel.label.name);
      });
      console.log(item);
      assigneeName = "none";
      if (item.assignee)
        assigneeName = item.assignee.services.github.username;
      Meteor.call('loadAuth');
      github.issues.edit({
        user: owner, 
        repo: reponame, 
        title: item.name,
        body: item.description,
        number: item.number,
        assignee: assigneeName,
        labels: labels
      }, function(err, res) {
        Fiber(function() {
          WorkItems.update(item._id, {$set: { unsync: false, dirty: false }});
        }).run();
        console.log(err);
      });
    });    
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
            // Need to user our assignee object instead of the github one.
            if (item.assignee && item.assignee.login){
              item.assignee = Meteor.users.findOne({'services.github.username': item.assignee.login});
            }
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
