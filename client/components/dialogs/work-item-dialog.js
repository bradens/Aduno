/**
 * work-item-dialog.js
 * Aduno project (http://aduno.meteor.com)
 * @author Braden Simpson (@bradensimpson)
 * 
 * Initialization for all client side code.
 */
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
          description: description,
          dirty: true
        }
    });
    // Sync the workitem 
    Meteor.call('synchronizeWorkItem', id);
    WorkItemDialog.clearDetailsDialogFields();
    $('#wiDetailsDialog').modal("hide");
  }
};

Template.wiDialog.labels = function() {
  return Labels.find({repo_id: Session.get("currentRepoId")});
};

Template.wiDialog.workitems = function() {
  return WorkItems.find(
    {
      $ne: {
        _id: WorkItemDialog.currentWiId
      },
      repo_id: Session.get("currentRepoId") 
    }
  );
};

Template.wiLinkItem.getOtherName = function() {
  if (WorkItemDialog.currentWiId == this.parentID)
    return WorkItems.findOne(this.childID).name;
  else
    return WorkItems.findOne(this.parentID).name;
};

WorkItemDialog = {
  currentWiId: null,
  clearDetailsDialogFields: function() {
    $('#wiDetailsDialog input, #wiDetailsDialog textarea').html('');
  },
  getUsersTypeahead: function(value) {
    var foundUsers = Meteor.users.find({'services.github.username': new RegExp('^' + value)}).fetch();
    var userArr = [];
    _.each(foundUsers, function(item) {
      userArr = userArr.concat(item.services.github.username);
    });
    return userArr;
  },
  removeLabelFromWi: function(e) {
    var data = $(this).closest("li");
    var labelName = data.attr('data-label-name');
    var wiId = $("#wiDetailsDialog").attr('editing-wi-id');
    WorkItems.update(wiId, {$pull: {labels: {'label.name': labelName}}});
    WorkItems.update(wiId, {$set: {dirty: true}});
    WorkItemDialog.renderWiLabels();
    WorkItemDialog.renderLabelLists();
  },
  removeLinkFromWi: function(e) {
    var linkId = $(this).closest("li").attr("data-link-id");
    Links.remove(linkId);    
    WorkItemDialog.renderWiLinks();
  },
  renderWiLabels: function() {
    var wi = WorkItems.findOne(WorkItemDialog.currentWiId);
    var labels = wi.labels;
    for (var i = 0; i < labels.length; i++) {
      if (labels[i] == null) {         
        labels.splice(i, 1);
        i--;
      }
    }
    var fragment = Meteor.render(Template.wiLabelItemList({labels: labels, wiId: id}));
    $("#wiDetailsDialog .wi-labels-controls").html(fragment);
    $("#wiDetailsDialog .label-delete").click(WorkItemDialog.removeLabelFromWi);
    $("#wiDetailsDialog .add-label").click(WorkItemDialog.addLabel);
  },
  renderWiLinks: function() {
    var links = Links.find({$or : [{childID: WorkItemDialog.currentWiId}, {parentID: WorkItemDialog.currentWiId}]}).fetch();
    var fragment = Meteor.render(Template.wiLinkItemList({links: links}));
    $("#wiDetailsDialog .wi-links-controls").html(fragment);
    $("#wiDetailsDialog .link-delete").click(WorkItemDialog.removeLinkFromWi);
    $("#wiDetailsDialog .add-link").click(WorkItemDialog.addLink);
  },
  renderLabelLists: function() {
    var wiLabels = WorkItems.findOne(WorkItemDialog.currentWiId).labels;
    var wiLabelsArr = [];
    _.each(wiLabels, function(item) {
      wiLabelsArr = wiLabelsArr.concat(item._id);
    });
    var allLabels = Labels.find({_id: {$nin: wiLabelsArr}}).fetch();

    // Populate this popover with the labels
    var labelsHtml = Meteor.render(Template.labelListPopover({labels: allLabels}));
    $wiLabelList = $('.wi-label-list');
    $wiLabelList.find("li.add-label").empty();
    $wiLabelList.find("li.add-label").append(labelsHtml);
    $wiLabelList.find("li").click(WorkItemDialog.labelClicked);
  },
  showWiDialog: function(id) {
    wi = WorkItems.findOne({_id: id});
    WorkItemDialog.currentWiId = id;
    WorkItemDialog.renderWiLabels();
    WorkItemDialog.renderWiLinks();
    WorkItemDialog.renderLabelLists();
    $("#wiAssigneeInput").typeahead({
      source: function(query) {
        this.process(WorkItemDialog.getUsersTypeahead(query));
      },
      minLength: 1
    });
    $('#wiNameDetails').val(wi.name);
    $('#wiDescDetails').val(wi.description);
    $('#wiDetailsDialog').attr('editing-wi-id', id);
    $('#wiDetailsDialog').modal().on("hidden", function() {
      if ($("#wiDetailsDialog").css("display") === "none"){
        workboard.userStopEditingItem(id);
        WorkItemDialog.currentWiId = null;
      }
    });
  },
  labelClicked: function(e) {
    var labelName = $(this).attr('data-label-name');
    var label = Labels.findOne({repo_id: Session.get("currentRepoId"), 'label.name': labelName});
    
    // Meteor doesn't support $addToSet so we have to find and then add if
    // doesn't exist
    if (!WorkItems.findOne({_id: WorkItemDialog.currentWiId, labels: label})){
      WorkItems.update(WorkItemDialog.currentWiId, {$push: {labels: label}});
      WorkItems.update(WorkItemDialog.currentWiId, {$set: {dirty: true}});
    }
    WorkItemDialog.renderWiLabels();
    WorkItemDialog.renderLabelLists();
  },
  addLink: function() {
    // TODO @bradens
    alert("Not supported yet.  Add links by clicking the 'link' button.");
  }
}