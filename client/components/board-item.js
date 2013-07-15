/**
 * board-item.js
 * Aduno project (http://aduno.braden.in)
 * @author Braden Simpson (@bradensimpson)
 * 
 * Helpers for board-items.  
 */

var helpers = {
	redrawAfterUpdate: function() {
		workboard.draw();
	},
	isOpen: function() {
		return (this._id == Session.get("OPEN_WI_ID") ? "open" : "");
	},
	getHidden: function() {
		if (Stories.findOne(this._id) && Stories.findOne(this._id).hidden)
			return "hide";
		else 
			return "";
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
