/**
 * methods.js
 * Aduno project (http://aduno.meteor.com)
 * @author Braden Simpson (@bradensimpson)
 * 
 * Define the methods used for server processing here.
 */
 Meteor.methods({
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
  updateLabels: function(username, reponame, repoId) {
    var labels = Labels.find({dirty: true, repo_id: repoId}).fetch();
    _.each(labels, function(item) {
      var oldLabelName = item.label.url.substring(item.label.url.lastIndexOf("/") + 1);
      console.log(oldLabelName);
      var accessToken = Meteor.users.findOne({'services.github.username': username}).services.github.accessToken;
      urlReq("https://api.github.com:443/repos/" + username + "/" + reponame + "/labels/" + oldLabelName, { 
        method: 'PATCH',
        headers: {"Authorization" : "bearer " + accessToken},
        params: {
          name: item.label.name,
          color: item.label.color
        }}, function(body, res) {
            Fiber(function() {
              Labels.update(item._id, {$set: {label: body, dirty: false}});
            }).run();
      });
    });
  }
 });