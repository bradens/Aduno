/**
 * workboard.js
 * Aduno project (http://aduno.meteor.com)
 * @author Braden Simpson (@bradensimpson)
 * 
 * Workboard code.  Used for manipulating the 'workboard' which is the name of the
 * main working area of Aduno.
 */
$(window).load(function() {
	/**
	 * DnD in meteor is currently bonkers, in order to completely get it working,
	 * you have to attach a .draggable() to the element on mouseover, then listen for a
	 * drag event on the body and update the Meteor.Collection accordingly.
	 */
	$('body').on('dragstop', '.workItem', function (e) {
	    var position = $(e.target).position();
	    WorkItems.update($(e.currentTarget).attr('data-wi-id'), {$set: {
	    	top: position.top,
	    	left: position.left
	    }});
	    workboard.draw();
	});
	if (window.workboard == undefined)
	{
		window.workboard = new WorkBoard(); 
	}
	
	$("#myCanvas")[0].addEventListener('mousemove', workboard.ev_canvas, false);
	if (!workboard.canvas) workboard.canvas = document.getElementById('myCanvas');
	workboard.ctx = workboard.canvas.getContext('2d');
	
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