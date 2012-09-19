this.WorkItems = new Meteor.Collection("workitems");
this.People = new Meteor.Collection("people");
if (Meteor.is_server)
{
    Meteor.publish('workitems', function() {
    	return WorkItems.find({});
    });
    Meteor.publish('people', function() {
    	return People.find({});
    });
}