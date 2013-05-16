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
    // var accessToken = Meteor.users.findOne(this.userId).services.github.accessToken;
    var labels = Labels.find({dirty: true, repo_id: repoId}).fetch();
    repoObj = Repos.findOne(repoId);
    _.each(labels, function(item) { 
      // var oldLabelName = item.url.substring(item.url.lastIndexOf("/") + 1);
      parms = { 
        user: repoObj.owner,
        repo: repoObj.name,
        name: item.name,
        color: item.color
      }
      github.issues.updateLabel(parms,
      // urlReq("https://api.github.com:443/repos/" + repoObj.owner + "/" + repoObj.name + "/labels/" + oldLabelName, { 
      //   method: 'PATCH',
      //   headers: {"Authorization" : "bearer " + accessToken,
      //             "User-Agent": "Mozilla/5.0 (iPad; U; CPU OS 3_2_1 like Mac OS X; en-us) AppleWebKit/531.3_2_11.10 (KHTML, like Gecko) Mobile/7B405"},
      //   params: {
      //     name: item.name,
      //     color: item.color
      // }}
          function(err, res) {
          if (err) {
            log(err)
          }
          Fiber(function() {
            Labels.update(item._id, {$set: {dirty: false}});
          }).run();
      });
    });
  }
 });