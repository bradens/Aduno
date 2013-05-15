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
    workboard.IS_DRAGGING = false;
      var position = $(e.target).position();
      WorkItems.update($(e.currentTarget).attr('data-wi-id'), {$set: {
        top: position.top,
        left: position.left,
        zIndex: $(this).css('z-index')
      }});
      workboard.draw();
  });
  
  $('body').on('drag', '.workItem', function (e) {
    $("[id*=-editor]").hide();
    workboard.IS_DRAGGING = true;
    workboard.draw();
  });

  if (window.workboard == undefined)
    window.workboard = new WorkBoard(); 

  function WorkBoard() {
    // Get the listeners for our canvas going.
    this.zIndexBuffer = 20;       // TODO @bradens @fixme This is a hacky way to alter the z-index for stacking elements.
    this.currentLineID = '';
    this.IS_DRAGGING = false;
    this.createNewWorkItem = function () {
      var position = workboard.getNewItemPos();
      var label = Labels.findOne({repo_id: Session.get("currentRepoId"), 'label.name' : Session.get("currentLabel")});
      var id = WorkItems.insert({
        labels: ((label == null) ? [] : [label]),
        name: "New WorkItem",
        repo_id: Session.get("currentRepoId"),
        description: "Default description",
        top: position.top,
        left: position.left,
        newItem: true
      });
    };
    this.updateCanvas = function() {
      $("#myCanvas")[0].addEventListener('mousemove', workboard.ev_canvas, false);
      workboard.canvas = document.getElementById('myCanvas');
      workboard.ctx = workboard.canvas.getContext('2d');
    };
    this.draw = function() {
      // This is the case when the workboard is hidden due to the welcome
      if (!($("#myCanvas")[0])) return; 
      this.updateCanvas();
      workboard.ctx.clearRect(0,0,workboard.canvas.width, workboard.canvas.height);
      Links.find({repo_id: Session.get("currentRepoId")}).forEach(function(Link) {
        workboard.ctx.beginPath();
        if (Session.get("currentLabel") === "all") {
          wi = WorkItems.findOne({_id: Link.parentID });
          wiChild = WorkItems.findOne({_id: Link.childID});
        }
        else {
          wi = WorkItems.findOne({_id: Link.parentID, 'labels.label.name' : Session.get("currentLabel") });
          wiChild = WorkItems.findOne({_id: Link.childID, 'labels.label.name' : Session.get("currentLabel")});
        }
        
        if (!wi || !wiChild)
          return;
        $wi = $("[data-wi-id="+Link.parentID+"]");
        $wiChild = $("[data-wi-id="+Link.childID+"]");
        
        if (workboard.IS_DRAGGING) {
          // Use the temp position specified by the position of the 'dragging' workitem
          workboard.ctx.moveTo($wi.position().left - $(workboard.canvas).offset().left + $wi.width()/2,($wi.position().top + $wi.height()/2) - $(workboard.canvas).offset().top);
          workboard.ctx.lineTo($wiChild.position().left - $(workboard.canvas).offset().left + $wiChild.width()/2,($wiChild.position().top + $wiChild.height()/2)- $(workboard.canvas).offset().top);
        }
        else {
          workboard.ctx.moveTo(wi.left - $(workboard.canvas).offset().left + $wi.width()/2,(wi.top + $wi.height()/2) - $(workboard.canvas).offset().top);
          workboard.ctx.lineTo(wiChild.left - $(workboard.canvas).offset().left + $wiChild.width()/2,(wiChild.top + $wiChild.height()/2) - $(workboard.canvas).offset().top);
        }
        workboard.ctx.stroke();
      });
    };
    
    // Event handler for the canvas animation
    this.ev_canvas = function (e)
    {
      workboard.draw();
      if (workboard.IS_LINKING)
        workboard.drawLine(e);
    };
    
    // Draws a line from the current workitem to the event position (mouse).
    this.drawLine = function (e) {
      this.updateCanvas();
      this.ctx.beginPath();
      wi = WorkItems.findOne({_id: this.currentLineID});
      $wi = $("[data-wi-id="+this.currentLineID+"]");
        this.ctx.moveTo(wi.left - $(this.canvas).offset().left + $wi.width()/2,wi.top - $(this.canvas).offset().top);
      this.ctx.lineTo(e.offsetX, e.offsetY);
        this.ctx.stroke();
    };

    // Add the notification to show that a user is editing an item
    this.userEditingItem = function(itemId) {
      username = Meteor.user().services.github.username;
      badge = Meteor.user().badge;
      
      // First remove all erroneous edits that might still be going on.  Can't be editing two things at once.
      Meteor.call('removeEditing', username);
      
      // Now update item with user as editor.
      WorkItems.update(itemId, {$push: {usersEditing: { name: username, badge: badge}}});
    };

    // Remove the notification to show that a user is editing an item
    this.userStopEditingItem = function(itemId) {
      username = Meteor.user().services.github.username;
      WorkItems.update(itemId, {$pull: {usersEditing: {name: username}}});
    };

    // Function that returns a new item position psuedorandomly.
    this.getNewItemPos = function() {
      var $mat = $("#myCanvas");
      var top = $mat.offset().top + 50 + Math.floor(Math.random() * 60) - 15;
      var left = $mat.offset().left + $mat.width() / 2 - 72 + Math.floor(Math.random() * 60) - 15;
      return { top: top, left: left };
    };
  }
});