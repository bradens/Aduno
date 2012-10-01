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
                  console.log(user_id);
                  Repos.update(
                      adRepo._id,
                      {$push: { user_ids: user_id
                      }}
                  );
                }
              }
              else {
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
            var skip = false;
            // Now remove anything that is in aduno but not github.
            for(var i = 0;i < repoList.length; i++) {
              for (var j = 0;j < res.length;j++){
                // Got this one, skip it.
                skip = true;
              }
              if (!skip) {
                console.log(repoList[i]);
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
  
  // Load all of the issues for a specific repo
  // Once again, github information takes precedence.
  loadIssues: function(repo_id) {
    //TODO @bradens
    
    
    
    return null;
  },
  
  // THIS IS OUT OF DATE
  // todo @braden delete this
  postWorkItemAsIssue: function (wiID)
  {
    var wi = WorkItems.findOne({_id: wiID});
    console.log("Posting work item " + wiID);
    github.issues.create({
      user: "bradens",
      repo: "TestingRepo",
      title: wi.name,
      body: wi.description,
      labels: []
    }, function(err, res) {
      console.log(res);
    });
  }
});