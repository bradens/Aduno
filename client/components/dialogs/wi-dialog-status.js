Template.wiDialogStatus.getOpenState = function() {
  return defines.WI_OPEN_STATE;
}
Template.wiDialogStatus.getClosedState = function() {
  return "close";
}
Template.wiDialogStatus.getOpenDisabled = function() {
  if (!WorkItemDialog.currentWiId) return "";
  if (WorkItems.findOne(WorkItemDialog.currentWiId).state === defines.WI_OPEN_STATE) {
    return "disabled";
  }
  else {
    return "";
  }
}
Template.wiDialogStatus.getCloseDisabled = function() {
  if (!WorkItemDialog.currentWiId) return "";
  if (WorkItems.findOne(WorkItemDialog.currentWiId).state === defines.WI_CLOSED_STATE) {
    return "disabled";
  }
  else {
    return "";
  }
}
Template.wiDialogStatus.setupEvents = function() {
  $("#workitem-status-open-btn").click(function() {
    Meteor.call('openWorkItem', WorkItemDialog.currentWiId, function() {
      WorkItemDialog.renderStatus();
    });
  });
  $("#workitem-status-close-btn").click(function() {
      Meteor.call('closeWorkItem', WorkItemDialog.currentWiId, function() {
        WorkItemDialog.renderStatus();
      });
  });
};