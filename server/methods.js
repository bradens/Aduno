/**
 * methods.js
 * Aduno project (http://aduno.meteor.com)
 * @author Braden Simpson (@bradensimpson)
 * 
 * Define the methods used for server processing here.
 */
Meteor.methods({
  keepalive: function (user_id) {
    if (!(ActiveUsers.findOne({user_id: user_id}))){
      ActiveUsers.insert({
        user_id: user_id,
        last_keepalive: (new Date()).getTime(),
        idle: false
      });
    }
    else {
      ActiveUsers.update({
        user_id: user_id
      },
      { $set: {
        last_keepalive: (new Date()).getTime(),
        idle: false
      }});
    }
  },
  authenticated : function(user_id) {
    var user = Meteor.users.findOne(user_id);
    var badge = user.badge !== undefined ? user.badge : randomBadge();
    Meteor.users.update({
        _id: user_id
      },
      { $set: {
        idle: false,
        badge: badge
      }
    });
    github.authenticate ({
      type: "oauth",
      token: Meteor.users.findOne(user_id).services.github.accessToken
    });
  }, 
  
  //-------------------------------------- Labels --------------------------------------// 
  addLabel: function (username, reponame, repoId, labelObject) {
    github.issues.createLabel({
      repo: reponame,
      user: username,
      name: labelObject.name,
      color: labelObject.color
    }, function(err, res){
      Fiber(function() {
        if (err){ 
          console.log("ERROR");
          return false;
        }
        else {
          Labels.insert({
            label: res,
            repo_id: repoId
          });
          return true;
        }
      }).run();
    });
  },
  deleteLabel : function (user_id, username, reponame, labelname) {
    var accessToken = Meteor.users.findOne(user_id).services.github.accessToken;
    var repoId = Repos.findOne({name: reponame})._id;
    urlReq("https://api.github.com:443/repos/" + username + "/" + reponame + "/labels/" + labelname.replace(" ", "+"), {
          method: "DELETE",
          headers: {"Content-length" : "0", "Authorization" : "bearer " + accessToken}
        }, function(err, res) {
          if (err)
            console.log("Error : " + err);
          else {
              Fiber(function() { 
                Labels.remove({repo_id: repoId, 'label.name': labelname});
              }).run();
            }
        }
    );
  },
  // Load Github repos for a user.
  // We will *always* give preference to a github repos information
  // since it controls who has access to what.
  // This will update the github repo side, which will be used to switch
  // to our 'aduno' draft versions of each repo.
  loadRepos: function (user_id) {
    var repoList = Repos.find({user_ids: user_id}).fetch();
    github.repos.getAll({},
      function(err, res) {
        if (err) {
          console.log(err);
          return;
        }
        else {
          Fiber(function() {
            for(var i = 0;i < res.length; i++) {
              // Before inserting, check if it exists in aduno, but 
              // we just havent synced collaborators.
              var adRepo = Repos.findOne({github_id: res[i].id});
              if (adRepo) {
                if (!(_.contains(adRepo.user_ids, user_id))) {
                  // just update the users list to be with the new user
                  Repos.update(
                      adRepo._id,
                      {$push: { user_ids: user_id
                      }}
                  );
                }
              }
              else {
                if (res[i].has_issues) {
                  // It's new, insert it
                  Repos.insert({
                    github_id: res[i].id,
                    user_ids: [user_id],
                    name: res[i].name,
                    owner: res[i].owner.login,
                    url: res[i].owner.url
                  });
                }
              }
            }
            var skip = false;
            // Now remove anything that is in aduno but not github.
            for(var i = 0;i < repoList.length; i++) {
              for (var j = 0;j < res.length;j++){
                // Got this one, skip it.
                skip = true;
              }
              if (!skip) {
                var github_id = repoList[i].github_id;
                Repos.update(
                    github_id,
                    {$pull: { user_ids: user_id
                    }}
                );
              }
            }
          }).run();
        }
      }
    );
  },
  
  // TODO @bradens
  // Currently updating labels is not supported...the github api we use doesn't allow 
  // for updates 
  updateLabels: function(username, reponame, repoId) {
    console.log("Unsupported");
//    var labels = Labels.find({dirty: true, repo_id: repoId}).fetch();
//    _.each(labels, function(item) {
//      var oldLabelName = item.label.url.substring(item.label.url.lastIndexOf("/") + 1);
//      var accessToken = Meteor.users.findOne({'services.github.username': username}).services.github.accessToken;
//      console.log("https://api.github.com/repos/" + username + "/" + reponame + "/labels/" + oldLabelName + "?access_token=" + accessToken);
//      urlReq("https://api.github.com/repos/" + username + "/" + reponame + "/labels/" + oldLabelName + "?access_token=" + accessToken,
//          {
//            method: 'PUT',
//            params: {
//              name: item.label.name,
//              color: item.label.color
//            }
//          }, function(body, res) {
//            console.log(body + "\n" + res);
//          });
//      });

//      github.issues.updateLabel({
//        user: username,
//        repo: reponame, 
//        name: item.label.name,
//        color: item.label.color
//      }, function(err, res) {
//        if (err)
//          console.log(err);
//      });
//    });
  },
      
  // Load all the labels for a repo
  loadLabels : function(username, reponame) {
    github.issues.getLabels({
      user: username,
      repo: reponame
    },
    function(err, res) {
      if (err){
        console.log(err)
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
                'label.name': item.name
              })) {
              Labels.insert({
                repo_id: repoObj._id,
                label: item
              });
            }
          });
        }).run();
      }
    });
  },
  //Load all of the issues for a specific repo
  // Once again, github information takes precedence.
  loadIssuesWithLabels: function(username, reponame, labels) {
    //TODO @bradens
    if (!labels || labels.length == 0) {
      labels = null;
    }
    console.log(labels);
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
    console.log(result);
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
      });
    }).run();
  },
  // TODO @bradens
  synchronize: function(username, reponame, repoId) {
    Meteor.call('updateLabels', username, reponame, repoId);
  }
});