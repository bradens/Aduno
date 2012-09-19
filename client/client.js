(function() {
	if (window.workboard == undefined)
	{
		window.workboard = new WorkBoard(); 
	}
	function WorkBoard() {
		this.items = [];
		this.createNewWorkItem = function () {
			this.items = this.items.concat(new WorkItem("New WorkItem"));
			var position = GetNewItemPos();
			WorkItems.insert({
				name: "New WorkItem",
				top: position.top,
				left: position.left
			});
		};
		function WorkItem(name) {
			this.name = name;
		}
		function GetNewItemPos() {
			var $mat = $(".row.canvas");
			var top = $mat.height() / 2 - 100 + Math.floor(Math.random() * 31) - 15;
			var left = $mat.width() / 2 - 72 + Math.floor(Math.random() * 31) - 15;
			return { top: top, left: left };
		}
	}
})();

Meteor.startup(function() {
	var login_id;
	Meteor.autosubscribe(function() {
		Meteor.subscribe('workitems');
	});
});

function FindWorkItems() {
	return WorkItems.find({
		name: {
			$ne: ""
		}
	}, { 
		sort: {
			name: 1
		}
	});
}

Template.main.workitems = function() {
	return WorkItems.find({
		name: {
			$ne: ""
		}
	}, { 
		sort: {
			name: 1
		}
	});
}

/** FUCK i hate DnD in meteor. **/
$(function() {
	$('body').on('dragstop', '.workItem', function (e) {
	    console.log(e);
	    var position = $(e.target).position();
	    WorkItems.update(e.currentTarget.id.substring(3), {$set: {
	    	top: position.top,
	    	left: position.left
	    }});
	});
});

Template.workitem.title = function() {
	return "New WorkItem";
}
Template.workitem.events = {
	'click input.details' : function () {
		alert("Workitem details");
	},
	'mouseover .workItem' : function() {
		$('#wi_'+this._id).draggable();
	},
	'dragstop .workItem' : function (e) {
		var position = $(e.target).position();
		WorkItems.update(this._id, {$set :{top: position.top, left: position.left}});
	}
};
Template.main.events = {
	'click #newWorkItem' : function () {
		workboard.createNewWorkItem();
	}
}
