this.WorkItems = new Meteor.Collection("workitems");
if (Meteor.is_server)
{
    Meteor.publish('workitems', function() {
    	return WorkItems.find({});
    });
}