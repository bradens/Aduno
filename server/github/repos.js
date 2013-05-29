/**
 * repos.js
 * Aduno project (http://aduno.braden.in)
 * @author Braden Simpson (@bradensimpson)
 * 
 * Define the methods used for server processing here.
 */
var Fiber = Npm.require('fibers');
Meteor.methods({
  loadRepo: function(user, repo) {
    Meteor.call('loadAuth');
    github.repos.get({
      user: user,
      repo: repo
    }, function (err, res) {
      if (err) {
        log(err);
      }
      else {
        Fiber(function() {
          var adRepo = Repos.findOne({github_id: res.id});
          if (adRepo) {
            // we already have it in the system, do nothing.
            log("Repo already in db")
          }
          else {
            if (res.has_issues) {
              // It's new, insert it
              log("inserting repo " + res.name);
              Repos.insert({
                github_id: res.id,
                name: res.name,
                owner: res.owner.login,
                url: res.owner.url
              });
            }
          }
          // log(res);
        }).run();
      }
    });
  },
	// Load Github repos for a user.
  // We will *always* give preference to a github repos information
  // since it controls who has access to what.
  // This will update the github repo side, which will be used to switch
  // to our 'aduno' draft versions of each repo.
  loadRepos: function (user_id) {
    Meteor.call("loadAuth");
    var repoList = Repos.find({user_ids: user_id}).fetch();
    github.repos.getAll({},
      function(err, res) {
        if (err) {
          log(err);
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
	}
});