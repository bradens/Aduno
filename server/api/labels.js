/**
 * methods.js
 * Aduno project (http://aduno.meteor.com)
 * @author Braden Simpson (@bradensimpson)
 * 
 * Define the methods used for server processing here.
 */
 var Fiber = Npm.require('fibers');
 Meteor.methods({
  // Load all the labels for a repo
	loadLabels : function(username, reponame) {
    github.issues.getLabels({
      user: username,
      repo: reponame
    },
    function(err, res) {
      if (err){
        log(err);
        return;
      }
      else {
        Fiber(function() {
          var repoObj = Repos.findOne({
            owner : username, 
            name : reponame
          });
          _.each(res, function(item) {
            if (!Labels.findOne({
                repo_id: repoObj._id,
                name: item.name
              })) {
              Labels.insert({
                repo_id: repoObj._id,
                name: item.name,
                color: item.color,
                url: item.url
              });
            }
          });
        }).run();
      }
    });
  },
  addLabel: function (username, reponame, repoId, labelObject) {
    Meteor.call("loadAuth");
    github.issues.createLabel({
      repo: reponame,
      user: username,
      name: labelObject.name,
      color: labelObject.color
    }, function(err, res){
      Fiber(function() {
        if (err){ 
          log(err);
          return false;
        }
        else {
          Labels.insert({
            name: res.name,
            color: res.color,
            url: res.url,
            repo_id: repoId
          });
          return true;
        }
      }).run();
    });
  },
  deleteLabel : function (repoId, labelName) {
    Meteor.call("loadAuth");
    labelObj = Labels.findOne({repo_id: repoId, name: labelName});
    repoObj = Repos.findOne(labelObj.repo_id); 

    parms = {
      user: repoObj.owner,
      repo: repoObj.name,
      name: labelObj.name
    }
    
    github.issues.deleteLabel(parms, function(err, res) {
      if (err) {
        log(err);
      }
      else {
        Fiber(function() {
          // Remove all references from the work item's as well.
          // TODO @bradens
          Labels.remove(labelObj._id);
        }).run();
      }
    });
  },

  // Synch our labels with github 
  updateLabels: function(repoId) {
    var labels = Labels.find({dirty: true, repo_id: repoId}).fetch();
    _.each(labels, function(item) {
      var oldLabelName = item.label.url.substring(item.label.url.lastIndexOf("/") + 1);
      
      // parms = {
      //   name: oldLabelName,
      //   repo: reponame, 
      //   user: username
      // }
      // github.issues.updateLabel(parms)

      urlReq("https://api.github.com:443/repos/" + username + "/" + reponame + "/labels/" + oldLabelName, { 
        method: 'PATCH',
        headers: {"Authorization" : "bearer " + accessToken},
        params: {
          name: item.name,
          color: item.color
        }}, function(err, res) {
          if (err) {
            log(err)
          }
          Fiber(function() {
            Labels.update(item._id, {$set: {url: JSON.parse(body).url, dirty: false}});
          }).run();
      });
    });
  }
 });