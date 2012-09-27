/**
 * methods.js
 * Aduno project (http://aduno.meteor.com)
 * @author Braden Simpson (@bradensimpson)
 * 
 * Define the methods used for server processing here.
 */
Meteor.methods({
  keepalive: function (user_id) {
    var user = Meteor.users.findOne(user_id);
    if (!user)
      return;
    var badge = user.badge !== undefined ? user.badge : randomBadge();
    Meteor.users.update({
      _id: user_id
      },
      { $set: {
          last_keepalive: (new Date()).getTime(),
          idle: false,
          badge: badge
        }
      });
  },
  authenticated : function(user_id) {
    console.log("Authenticating...");
    github.authenticate ({
      type: "oauth",
      token: Meteor.users.findOne(user_id).services.github.accessToken
    });
  }, 
  loadRepos: function (user_id) {
    console.log("Loading repos...");
    github.repos.getAll({
        },
        function(err, res) {
            console.log(err)
            console.log(res);
            
        }
    );
  },
  // THIS IS OUT OF DATE
  // todo @braden
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