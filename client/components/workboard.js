/**
 * workboard.js
 * Aduno project (http://aduno.braden.in)
 * @author Braden Simpson (@bradensimpson)
 * 
 * Workboard code.  Used for manipulating the 'workboard' which is the name of the
 * main working area of Aduno.
 */
$(window).load(function() {
  /**
   * DnD in meteor is..not fun. In order to completely get it working,
   * you have to attach a .draggable() to the element on mouseover, then listen for a
   * drag event on the body and update the Meteor.Collection accordingly.
   */
  $('body').on('dragstop', '.workItem', function (e) {
    workboard.IS_DRAGGING = false;
      var position = $(e.target).position();
      WorkItems.update($(e.currentTarget).attr('data-item-id'), {$set: {
        top: position.top,
        left: position.left,
        zIndex: $(this).css('z-index')
      }});
      workboard.draw();
  });
  $('body').on('dragstop', '.storyItem', function (e) {
    workboard.IS_DRAGGING = false;
      var position = $(e.target).position();
      Stories.update($(e.currentTarget).attr('data-item-id'), {$set: {
        top: position.top,
        left: position.left,
        zIndex: $(this).css('z-index')
      }});
      workboard.draw();
  });
  
  $('body').on('drag', '.workItem,.storyItem', function (e) {
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
      var label = Labels.findOne({repo_id: Session.get("currentRepoId"), name: Session.get("currentLabel")});
      var id = WorkItems.insert({
        story_id: Session.get("currentStoryId"),
        labels: ((label == null) ? [] : [label]),
        name: "New WorkItem",
        repo_id: Session.get("currentRepoId"),
        description: "Default description",
        top: position.top,
        left: position.left,
        hidden: false,
        dirty: true
      });
    };

    this.createNewStoryItem = function() {
      var position = workboard.getNewItemPos();
      var id = Stories.insert({
        repo_id: Session.get("currentRepoId"),
        name: "New Story",
        descrioption: "Default description",
        top: position.top,
        left: position.left,
        hidden: false,
        dirty: true
      });
    };
    
    this.updateCanvas = function() {
      document.getElementById("myCanvas").addEventListener('mousemove', workboard.ev_canvas, false);
      workboard.canvas = document.getElementById('myCanvas');
      workboard.ctx = workboard.canvas.getContext('2d');
    };
    this.draw = function() {
      // This is the case when the workboard is hidden due to the welcome
      if (!($("#myCanvas")[0])) return; 
      this.updateCanvas();
      workboard.ctx.clearRect(0,0,workboard.canvas.width, workboard.canvas.height);
      
      if (Session.get("STORY_VIEW")) {
        StoryLinks.find({repo_id: Session.get("currentRepoId")}).forEach(function(Link) {
          workboard.ctx.beginPath();
          if (!Session.get("currentLabel") || Session.get("currentLabel") === "all") {
            si = Stories.findOne({_id: Link.parentID, hidden: false});
            siChild = Stories.findOne({_id: Link.childID, hidden: false});
          }
          else {
            si = Stories.findOne({_id: Link.parentID, hidden: false, "labels.name" : Session.get("currentLabel")});
            siChild = Stories.findOne({_id: Link.childID, hidden: false, "labels.name" : Session.get("currentLabel")});
          }

          if (!si || !siChild)
            return;
          $si = $("[data-item-id="+Link.parentID+"]");
          $siChild = $("[data-item-id="+Link.childID+"]");

          drawLinks($si, $siChild, si, siChild);
        });
      }
      else {
        Links.find({repo_id: Session.get("currentRepoId")}).forEach(function(Link) {
          workboard.ctx.beginPath();
          if (!Session.get("currentLabel") || Session.get("currentLabel") === "all") {
            wi = WorkItems.findOne({_id: Link.parentID});
            wiChild = WorkItems.findOne({_id: Link.childID});
          }
          else {
            wi = WorkItems.findOne({_id: Link.parentID, 'labels.name' : Session.get("currentLabel") });
            wiChild = WorkItems.findOne({_id: Link.childID, 'labels.name' : Session.get("currentLabel")});
          }
          
          if (!wi || !wiChild)
            return;
          $wi = $("[data-item-id="+Link.parentID+"]");
          $wiChild = $("[data-item-id="+Link.childID+"]");
          
          drawLinks($wi, $wiChild, wi, wiChild);
        });
      }
      function drawLinks($wi, $wiChild, wi, wiChild) {
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
      }
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
      var item;
      if (Session.get("STORY_VIEW")) {
        item = Stories.findOne({_id: this.currentLineID});
      }
      else {
        item = WorkItems.findOne({_id: this.currentLineID});
      }      
      $wi = $("[data-item-id="+this.currentLineID+"]");
        this.ctx.moveTo(item.left - $(this.canvas).offset().left + $wi.width()/2,item.top - $(this.canvas).offset().top);
      this.ctx.lineTo(e.offsetX, e.offsetY);
        this.ctx.stroke();
    };

    this.userEditingStoryItem = function(itemId) {
      username = Meteor.user().uniqueName;
      badge = Meteor.user().badge;
      Meteor.call('removeEditing', username, function() {
        // Now update item with user as editor.
        Stories.update(itemId, {$push: {usersEditing: { name: username, badge: badge}}});       
      });
    };

    // Add the notification to show that a user is editing an item
    this.userEditingWorkItem = function(itemId) {
      username = Meteor.user().uniqueName;
      badge = Meteor.user().badge;
      Meteor.call('removeEditing', username, function() {
        // Now update item with user as editor.
        WorkItems.update(itemId, {$push: {usersEditing: { name: username, badge: badge}}});
      });
    };

    // Remove the notification to show that a user is editing an item
    this.userStopEditingItem = function(itemId) {
      username = Meteor.user().uniqueName;
      WorkItems.update(itemId, {$pull: {usersEditing: {name: username}}});
      Stories.update(itemId, {$pull: {usersEditing: {name: username}}});
    };

    // Function that returns a new item position psuedorandomly.
    this.getNewItemPos = function() {
      var $mat = $("#myCanvas");
      var top = $mat.offset().top + Math.floor(Math.random() * $mat.height()) - 400;
      if (top <= $mat.offset().top) {
        top = $mat.offset().top + 10;
      }
      var left = $mat.offset().left + Math.floor(Math.random() * $mat.width()) - 227;
      if (left <= $mat.offset().left) {
        left = $mat.offset().left + 10;
      }
      return { top: top, left: left };
    };
  }
});
