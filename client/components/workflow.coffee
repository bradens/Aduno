# workboard.js
# Aduno project (http://aduno.braden.in)
# @author Braden Simpson (@bradensimpson)

class @Workflow
  constructor: ->
    @IS_LOGGING_IN = false
    @IS_LOGGED_IN = false
    @IS_EDITING_LABELS = false
    console.log('creating workflow')

  loggedIn: -> 
    @IS_LOGGED_IN = true
    Meteor.call "keepalive", Meteor.user()._id  if Meteor.user()
    Meteor.call "authenticated", Meteor.user()._id, @authenticatedCallback

  authenticatedCallback: -> 
    Session.set "user_id", Meteor.userId()
    # Initialize the help popover 
    if Session.get("currentRepoId") is `undefined` or Session.get("currentRepoId") is null
      $("#repo-select-dd-wrapper").popover(
        content: "Select a repository to begin"
        placement: "bottom"
      ).popover "show"

  createLabel: ->
    $("#newLabelDialog").attr "editing", "false"
    $("#newLabelDialog input").val ""
    $("#newLabelDialog").modal()

  labelColorEdited: ($elem, col) -> 
    $elem.css "background-color", col
  
  loadRepository: (repoName, repoId, repoOwner) ->
    Session.set "currentRepo", repoName
    Session.set "currentRepoId", repoId
    Meteor.call "loadStories", Session.get("currentRepoId"), defines.noop
    Meteor.call "loadLabels", repoOwner, repoName, defines.noop
    Meteor.call "loadIssuesWithLabels", repoOwner, repoName, [], defines.noop
    Session.set "STORY_VIEW", true
    Session.set "WORKITEM_VIEW", false
    Session.set "currentStoryId", null

  loadingCallback: ->
    Session.set "loadingQueueCount", Session.get("loadingQueueCount") - 1  if Session.get("loadingQueueCount") isnt `undefined` and typeof Session.get("loadingQueueCount") is "number"
    # Clear the notification
    workflow.hideNotification()  if Session.get("loadingQueueCount") <= 0

  loading: ->
    if Session.get("loadingQueueCount") isnt `undefined` and typeof Session.get("loadingQueueCount") is "number"
      Session.set "loadingQueueCount", Session.get("loadingQueueCount") + 1
    else
      Session.set "loadingQueueCount", 1
    if Session.get("loadingQueueCount") >= 1
      workflow.showNotification
        type: "loading"
        imageHtml: ""
        title: "Loading..."

  # Displays a notification which is rendered as 
  # Template.notifier (notifier.html)
  # Requires: 
  # params {
  #   type: defines.notificationType,
  #   imageHtml: htmlString  
  #   title: String
  #   subtext: String   
  # }
  showNotification: (params) ->
    if defines.LOADING_TYPES.indexOf(params.type) is -1
      console.log "ERROR: Wrong notification type"
      return
    $not = $("#notifier-wrapper")
    unless $not.exists()
      $("body").append Meteor.render(Template.notifier(params))
      $not = $("#notifier-wrapper")
    $not.fadeIn()

    
  # Removes the notification.
  hideNotification: ->
    $not = $("#notifier-wrapper")
    if $not.exists()
      $not.fadeOut ->
        $not.remove()

$ -> 
  window.workflow = new Workflow()