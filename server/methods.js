/**
 * methods.js
 * Aduno project (http://aduno.meteor.com)
 * @author Braden Simpson (@bradensimpson)
 * 
 * Define the methods used for server processing here.
 */
Meteor.methods({
  keepalive: function (user_id) {
    console.log("running keepalive " + user_id);
    var badge = Meteor.users.findOne(user_id).badge !== undefined ? Meteor.users.findOne(user_id).badge : randomBadge();
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