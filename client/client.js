/** 
 * Construct the workboard.
 */
$(function() {
	if (window.workboard == undefined)
	{
		window.workboard = new WorkBoard(); 
	}
	function WorkBoard() {
		this.currentLineID = '';
		this.createNewWorkItem = function () {
			var position = GetNewItemPos();
			var id = WorkItems.insert({
				name: "New WorkItem",
				description: "Default description",
				top: position.top,
				left: position.left
			});
		};
		this.draw = function() {
			workboard.ctx.clearRect(0,0,workboard.canvas.width, workboard.canvas.height);
			Links.find({}).forEach(function(Link) {
				workboard.ctx.beginPath();
				wi = WorkItems.findOne({_id: Link.parentID});
				wiChild = WorkItems.findOne({_id: Link.childID});
				$wi = $("[data-wi-id="+Link.parentID+"]");
				$wiChild = $("[data-wi-id="+Link.childID+"]");
			    workboard.ctx.moveTo(wi.left - $(workboard.canvas).offset().left + $wi.width()/2,wi.top - $(workboard.canvas).offset().top);
				workboard.ctx.lineTo(wiChild.left - $(workboard.canvas).offset().left + $wiChild.width()/2,wiChild.top - $(workboard.canvas).offset().top);
			    workboard.ctx.stroke();
			});
		};
		this.ev_canvas = function (e)
		{
			workboard.draw();
			if (workboard.is_Linking)
				workboard.drawLine(e);
		};
		this.drawLine = function (e) {
			this.ctx.beginPath();
			wi = WorkItems.findOne({_id: this.currentLineID});
			$wi = $("[data-wi-id="+this.currentLineID+"]");
		    this.ctx.moveTo(wi.left - $(this.canvas).offset().left + $wi.width()/2,wi.top - $(this.canvas).offset().top);
			this.ctx.lineTo(e.offsetX, e.offsetY);
		    this.ctx.stroke();
		}
		/**
		 * Function that returns a new item position psuedorandomly.
		 */
		function GetNewItemPos() {
			var $mat = $("#myCanvas");
			var top = $mat.offset().top + 50 + Math.floor(Math.random() * 31) - 15;
			var left = $mat.offset().left + $mat.width() / 2 - 72 + Math.floor(Math.random() * 31) - 15;
			return { top: top, left: left };
		}
	}
});

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
		Meteor.subscribe('links');
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
Template.main.links = function() {
	return Links.find({
		parentID: {
			$ne: ""
		},
		childID: {
			$ne: ""
		}
	}, { 
		sort: {
			linkedID: 1
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

Template.workitem.redrawAfterUpdate = function() {
	Meteor.defer(function() {
		workboard.draw();
	});
};
/**
 * DnD in meteor is currently bonkers, in order to completely get it working,
 * you have to attach a .draggable() to the element on mouseover, then listen for a
 * drag event on the body and update the Meteor.Collection accordingly.
 */
$(window).load(function() {
	$('body').on('dragstop', '.workItem', function (e) {
	    var position = $(e.target).position();
	    WorkItems.update($(e.currentTarget).attr('data-wi-id'), {$set: {
	    	top: position.top,
	    	left: position.left
	    }});
	    workboard.draw();
	});
	$("#myCanvas")[0].addEventListener('mousemove', workboard.ev_canvas, false);
	if (!workboard.canvas) workboard.canvas = document.getElementById('myCanvas');
	workboard.ctx = workboard.canvas.getContext('2d');
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
	'click .linkWI' : function(e) {
		workboard.is_Linking = true;
		workboard.currentLineID = $(e.currentTarget).closest(".workItem").attr("data-wi-id");
		e.stopPropagation();
	},
	'click .workItem' : function (e) {
		if (workboard.is_Linking)
		{
			workboard.is_Linking = false;
			// finish the link;
			Links.insert({
				parentID: workboard.currentLineID,
				childID: $(e.currentTarget).closest(".workItem").attr('data-wi-id')
			});
		}
	},
	'click .postIssue' : function(e) {
		if (!People.findOne({_id: Session.get('user_id')}).is_authenticated)
			$("#authDialog").modal();
		else
			Meteor.call('postWorkItemAsIssue', $(e.currentTarget).closest(".workItem").attr('data-wi-id'));
	},
	'mouseover .workItem' : function() {
		$('#wi_'+this._id).draggable({
			containment: '#myCanvas'
		});
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

Template.authDialog.events = {
	'click .authDialogOK' : function(e) {
		dialog = $("#authDialog");
		usr = dialog.find("#authUsername").val();
		pwd = dialog.find("#authPass").val();
		Meteor.call('auth', Session.get('user_id'), usr, pwd);
		$('#authDialog input, #wiDetailsDialog textarea').html('');
		$('#authDialog').modal("hide");
	}
};

Template.wiDialog.events = {
		'click .wiDialogCancel' : function (e) {
			//todo cancel?
		},
		'click .wiDialogSave' : function(e) {
			// Update Collection
			dialog = $("#wiDetailsDialog");
			id = dialog.attr('editing-wi-id');
			name = dialog.find("#wiNameDetails").val();
			description = dialog.find("#wiDescDetails").val();
			WorkItems.update(
					id,
					{ $set: {
						name: name, 
						description: description
					}
					});
			clearDetailsDialogFields();
			$('#wiDetailsDialog').modal("hide");
		}
};

function randomLabel()
{
	var labels = ['', 'label-success', 'label-warning', 'label-important', 'label-info', 'label-inverse'];
	return labels[Math.round((Math.random()*6))];
}

function scrollto(selector)
{
	$('html, body').animate({
        scrollTop: $(selector).offset().top
    }, 500);	
}

/**
 * Dialog Functions
 */
function clearDetailsDialogFields()
{
	$('#wiDetailsDialog input, #wiDetailsDialog textarea').html('');
}

function showWiDialog(id)
{
	wi = WorkItems.findOne({_id: id});
	$('#wiNameDetails').val(wi.name);
	$('#wiDescDetails').val(wi.description);
	$('#wiDetailsDialog').attr('editing-wi-id', id);
	$('#wiDetailsDialog').modal();
}