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
  removeLabelFromWi: function(e) {
    var data = $(this).closest("li");
    var labelName = data.attr('data-label-name');
    var wiId = $("#wiDetailsDialog").attr('editing-wi-id');
    WorkItems.update(wiId, {$pull: {labels: {'label.name': labelName}}});
    WorkItems.update(wiId, {$set: {dirty: true}});
    WorkItemDialog.renderWiLabels();
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
  showWiDialog: function(id) {
    wi = WorkItems.findOne({_id: id});
    WorkItemDialog.currentWiId = id;
    WorkItemDialog.renderWiLabels();
    WorkItemDialog.renderWiLinks();
    $('#wiNameDetails').val(wi.name);
    $('#wiDescDetails').val(wi.description);
    $('#wiDetailsDialog').attr('editing-wi-id', id);
    $('#wiDetailsDialog').modal().on("hidden", function() {
      workboard.userStopEditingItem(id);
      WorkItemDialog.currentWiId = null;
    });
  },
  labelSelectionDialog : {
    get: function() {
      return $("#label-selection-dialog");
    },
    labelClicked: function(e) {
      var labelName = $(this).attr('data-label-name');
      var label = Labels.findOne({repo_id: Session.get("currentRepoId"), 'label.name': labelName});
      WorkItems.update(WorkItemDialog.currentWiId, {$push: {labels: label}});
      WorkItems.update(WorkItemDialog.currentWiId, {$set: {dirty: true}});
      $(this).unbind('click');
      WorkItemDialog.labelSelectionDialog.get().modal('hide');
    },
    showLabelSelectionDialog: function() {
      $("#label-selection-dialog").modal().on('hidden', function() {
        WorkItemDialog.renderWiLabels();
      }).find('li').click(WorkItemDialog.labelSelectionDialog.labelClicked);
    }
  },
  addLabel: function() {
    WorkItemDialog.labelSelectionDialog.showLabelSelectionDialog();
  },
  addLink: function() {
    // TODO @bradens
    alert("Not supported yet.  Add links by clicking the 'link' button.");
  }
}