Template.topNav.people = function() {
  return Meteor.users.find({
    _id : {
      $ne: ""
    },
    idle : {
      $ne : true
    }
  }, {
    sort: {
      _id : 1
    }
  });
};