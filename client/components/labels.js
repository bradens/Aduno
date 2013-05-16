Template.labelItem.labelName = function() {
  return this.name;
};
Template.labelItem.events = {
    'click .label-delete' : function(e) {
      $("#warningDialog .warning-dialog-message").html("Deleting a label also removes it from each workitem it is associated with.");
      $("#warningDialog .warning-dialog-ok").html("Delete Label");
      $("#warningDialog").attr('current-label-name', $(e.target).closest('[data-label-name]').attr('data-label-name')).modal();
      e.stopPropagation();
    }
}
Template.labelItem.checkLabelActive = function() { 
  if (Session.get("currentLabel") != "all" && this.name == Session.get("currentLabel")) {
    return "active";
  }
  return "";
};
Template.labels.labels = function() {
    return Labels.find({
      repo_id: Session.get("currentRepoId"),
    });
};
Template.labels.checkAllLabel = function() {
  if (Session.get("currentLabel") == "all")
    return "active";
  else
    return "";
};
Template.labels.getEditingLabelStateMsg = function() {
  return Session.get("IS_EDITING_LABELS_MSG");
};
Template.labels.totalWorkItemCount = function() {
  return WorkItems.find().count();
};
Template.labelItem.getWorkItemCount = function() {
  return WorkItems.find({ 'labels.name' : this.name, repo_id : Session.get("currentRepoId") }).count();
};
Template.wiLabelItem.getLabelDarkColor = function() {
  return LightenDarkenColor(this.color, -50);
};
Template.addLabelItem.getLabelDarkColor = function() {
  return LightenDarkenColor(this.color, -50);
};