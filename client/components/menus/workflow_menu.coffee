Template.workflowMenu.getLabelPaneActive = ->
  if Session.get("STORY_VIEW") then "" else "active"

Template.workflowMenu.getStoryPaneActive = ->
  if Session.get("STORY_VIEW") then "active" else ""