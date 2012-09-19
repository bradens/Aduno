/** 
 * Construct the workboard.
 */
(function() {
	if (window.workboard == undefined)
	{
		window.workboard = new WorkBoard(); 
	}
	function WorkBoard() {
		this.createNewWorkItem = function () {
			var position = GetNewItemPos();
			var id = WorkItems.insert({
				name: "New WorkItem",
				description: "Default description",
				top: position.top,
				left: position.left
			});
		};
		/**
		 * Function that returns a new item position psuedorandomly.
		 */
		function GetNewItemPos() {
			var $mat = $(".canvas");
			var top = $mat.height() / 2 - 100 + Math.floor(Math.random() * 31) - 15;
			var left = $mat.width() / 2 - 72 + Math.floor(Math.random() * 31) - 15;
			return { top: top, left: left };
		}
	}
})();

Meteor.startup(function() {
	var user_id;
	user_id = People.insert({
	  name: "",
	  idle: false,
	  badge: randomLabel()
	});
	Session.set('user_id', user_id);

	Meteor.setInterval(function() {
    if (Meteor.status().connected)
    	Meteor.call('keepalive', Session.get('user_id'));
  	}, 20*1000);
	
	Meteor.autosubscribe(function() {
		Meteor.subscribe('workitems');
		Meteor.subscribe('people');
	});
});

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
};
Template.main.people = function() {
	return People.find({
		name : {
			$ne: ""
		}
	}, {
		sort: {
			name : 1
		}
	});
};

/**
 * DnD in meteor is currently bonkers, in order to completely get it working,
 * you have to attach a .draggable() to the element on mouseover, then listen for a
 * drag event on the body and update the Meteor.Collection accordingly.
 */
$(function() {
	$('body').on('dragstop', '.workItem', function (e) {
	    var position = $(e.target).position();
	    WorkItems.update($(e.currentTarget).attr('data-wi-id'), {$set: {
	    	top: position.top,
	    	left: position.left
	    }});
	});
});

Template.workitem.title = function() {
	return "New WorkItem";
}

Template.workitem.events = {
	'click .editTitleBtn' : function (e) {
		showWiDialog($(e.currentTarget).closest(".workItem").attr('data-wi-id'));
		$('#wiNameDetails').focus();
	},
	'click .details' : function (e) {
		showWiDialog($(e.currentTarget).closest(".workItem").attr('data-wi-id'));
	},
	'click .wiDelete' : function (e) {
		WorkItems.remove({_id: $(e.currentTarget).closest(".workItem").attr('data-wi-id')});
	},
	'mouseover .workItem' : function() {
		$('#wi_'+this._id).draggable();
	}
};

Template.main.events = {
	'click #newWorkItem' : function () {
		workboard.createNewWorkItem();
	},
	
	'keyup #usernameInput' : function (e) {
		var name;
		name = $('input#usernameInput').val().trim();
		return People.update(Session.get('user_id'), {
			$set: {
			  name: name
			}
		});
	}
}

Template.person.name = function() {
	return "default";
}

function randomLabel()
{
	var labels = ['', 'label-success', 'label-warning', 'label-important', 'label-info', 'label-inverse'];
	return labels[Math.round((Math.random()*6))];
}


/**
 * Dialog Functions
 */
function showWiDialog(id)
{
	$('#wiNameDetails').val(WorkItems.findOne({_id: id}).name);
	$('#wiDetailsDialog').modal();
}