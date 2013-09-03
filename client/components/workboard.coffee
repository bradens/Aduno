
 # workboard.js
 # Aduno project (http://aduno.braden.in)
 # @author Braden Simpson (@bradensimpson)
 # 
 # Workboard code.  Used for manipulating the 'workboard' which is the name of the
 # main working area of Aduno.

$ -> 
  $("body").on "dragstop", ".workItem", (e) ->
    workboard.IS_DRAGGING = false
    position = $(e.target).position()
    WorkItems.update $(e.currentTarget).attr("data-item-id"),
      $set:
        top: position.top
        left: position.left
        zIndex: $(this).css("z-index")

    workboard.draw()

  $("body").on "dragstop", ".storyItem", (e) ->
    workboard.IS_DRAGGING = false
    position = $(e.target).position()
    Stories.update $(e.currentTarget).attr("data-item-id"),
      $set:
        top: position.top
        left: position.left
        zIndex: $(this).css("z-index")

    workboard.draw()

  $("body").on "drag", ".workItem,.storyItem", (e) ->
    $("[id*=-editor]").hide()
    workboard.IS_DRAGGING = true
    workboard.draw()

  window.workboard = new Workboard

class @Workboard
  constructor: ->
    @zIndexBuffer = 20 # TODO @bradens @fixme This is a hacky way to alter the z-index for stacking elements.
    @currentLineID = ""
    @IS_DRAGGING = false

  createNewWorkItem: ->
    position = workboard.getNewItemPos()
    label = Labels.findOne(
      repo_id: Session.get("currentRepoId")
      name: Session.get("currentLabel")
    )
    id = WorkItems.insert(
      story_id: Session.get("currentStoryId")
      labels: ((if (not (label?)) then [] else [label]))
      name: "New WorkItem"
      repo_id: Session.get("currentRepoId")
      description: "Default description"
      top: position.top
      left: position.left
      hidden: false
      dirty: true
    )

  createNewStoryItem: -> 
    position = workboard.getNewItemPos()
    id = Stories.insert(
      repo_id: Session.get("currentRepoId")
      name: "New Story"
      descrioption: "Default description"
      top: position.top
      left: position.left
      hidden: false
      dirty: true
    )

  updateCanvas: -> 
    document.getElementById("myCanvas").addEventListener "mousemove", workboard.ev_canvas, false
    workboard.canvas = document.getElementById("myCanvas")
    workboard.ctx = workboard.canvas.getContext("2d")

  draw: ->
    # This is the case when the workboard is hidden due to the welcome
    drawLinks = ($wi, $wiChild, wi, wiChild) ->
      if workboard.IS_DRAGGING
        
        # Use the temp position specified by the position of the 'dragging' workitem
        workboard.ctx.moveTo $wi.position().left - $(workboard.canvas).offset().left + $wi.width() / 2, ($wi.position().top + $wi.height() / 2) - $(workboard.canvas).offset().top
        workboard.ctx.lineTo $wiChild.position().left - $(workboard.canvas).offset().left + $wiChild.width() / 2, ($wiChild.position().top + $wiChild.height() / 2) - $(workboard.canvas).offset().top
      else
        workboard.ctx.moveTo wi.left - $(workboard.canvas).offset().left + $wi.width() / 2, (wi.top + $wi.height() / 2) - $(workboard.canvas).offset().top
        workboard.ctx.lineTo wiChild.left - $(workboard.canvas).offset().left + $wiChild.width() / 2, (wiChild.top + $wiChild.height() / 2) - $(workboard.canvas).offset().top
      workboard.ctx.stroke()
    return  unless $("#myCanvas")[0]
    @updateCanvas()
    workboard.ctx.clearRect 0, 0, workboard.canvas.width, workboard.canvas.height
    if Session.get("STORY_VIEW")
      StoryLinks.find(repo_id: Session.get("currentRepoId")).forEach (Link) ->
        workboard.ctx.beginPath()
        if not Session.get("currentLabel") or Session.get("currentLabel") is "all"
          si = Stories.findOne(
            _id: Link.parentID
            hidden: false
          )
          siChild = Stories.findOne(
            _id: Link.childID
            hidden: false
          )
        else
          si = Stories.findOne(
            _id: Link.parentID
            hidden: false
            "labels.name": Session.get("currentLabel")
          )
          siChild = Stories.findOne(
            _id: Link.childID
            hidden: false
            "labels.name": Session.get("currentLabel")
          )
        return  if not si or not siChild
        $si = $("[data-item-id=" + Link.parentID + "]")
        $siChild = $("[data-item-id=" + Link.childID + "]")
        drawLinks $si, $siChild, si, siChild

    else
      Links.find(repo_id: Session.get("currentRepoId")).forEach (Link) ->
        workboard.ctx.beginPath()
        if not Session.get("currentLabel") or Session.get("currentLabel") is "all"
          wi = WorkItems.findOne(_id: Link.parentID)
          wiChild = WorkItems.findOne(_id: Link.childID)
        else
          wi = WorkItems.findOne(
            _id: Link.parentID
            "labels.name": Session.get("currentLabel")
          )
          wiChild = WorkItems.findOne(
            _id: Link.childID
            "labels.name": Session.get("currentLabel")
          )
        return  if not wi or not wiChild
        $wi = $("[data-item-id=" + Link.parentID + "]")
        $wiChild = $("[data-item-id=" + Link.childID + "]")
        drawLinks $wi, $wiChild, wi, wiChild

  ev_canvas: (e) ->
    workboard.draw()
    workboard.drawLine e if workboard.IS_LINKING

  drawLine: (e) -> 
    @updateCanvas()
    @ctx.beginPath()
    item = undefined
    if Session.get("STORY_VIEW")
      item = Stories.findOne(_id: @currentLineID)
    else
      item = WorkItems.findOne(_id: @currentLineID)
    $wi = $("[data-item-id=" + @currentLineID + "]")
    @ctx.moveTo item.left - $(@canvas).offset().left + $wi.width() / 2, item.top - $(@canvas).offset().top
    @ctx.lineTo e.offsetX, e.offsetY
    @ctx.stroke()

  userEditingStoryItem: (itemId) ->
    username = Meteor.user().uniqueName
    badge = Meteor.user().badge
    Meteor.call "removeEditing", username, ->
      # Now update item with user as editor.
      Stories.update itemId,
        $push:
          usersEditing:
            name: username
            badge: badge

  # Add the notification to show that a user is editing an item
  userEditingWorkItem: (itemId) ->
    username = Meteor.user().uniqueName
    badge = Meteor.user().badge
    Meteor.call "removeEditing", username, ->
      
      # Now update item with user as editor.
      WorkItems.update itemId,
        $push:
          usersEditing:
            name: username
            badge: badge

  # Remove the notification to show that a user is editing an item
  userStopEditingItem: (itemId) ->
    username = Meteor.user().uniqueName
    WorkItems.update itemId,
      $pull:
        usersEditing:
          name: username

    Stories.update itemId,
      $pull:
        usersEditing:
          name: username

  getNewItemPos: -> 
    $mat = $("#myCanvas")
    top = $mat.offset().top + Math.floor(Math.random() * $mat.height()) - 400
    top = $mat.offset().top + 10  if top <= $mat.offset().top
    left = $mat.offset().left + Math.floor(Math.random() * $mat.width()) - 227
    left = $mat.offset().left + 10  if left <= $mat.offset().left
    top: top
    left: left
