/**
 * work-item.js
 * Aduno project (http://aduno.braden.in)
 * @author Braden Simpson (@bradensimpson)
 * 
 * Helpers for board-items.  
 */

var helpers = {
	getHidden: function() {
		if (Stories.findOne(this._id).hidden)
			return "hide";
		else 
			return "";
	},
	redrawAfterUpdate: function() {
		if (workboard) workboard.draw();
	},
	usersEditing: function() {
		return this.usersEditing;
	},
	synchronizedClass: function() {
		return (this.dirty ? "btn-warning" : "btn-success");
	}
};
Template.story.helpers(helpers);
Template.workitem.helpers(helpers);
