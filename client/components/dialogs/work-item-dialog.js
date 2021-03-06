/**
 * work-item-dialog.js
 * Aduno project (http://aduno.braden.in)
 * @author Braden Simpson (@bradensimpson)
 */
Template.wiDialog.events = {
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
  },
  'focus #wiDescDetails, keyup #wiDescDetails' : function(e) {
    WorkItemDialog.renderSidebar(defines.PREVIEW_TITLE, WorkItemDialog.$node.find("#wiDescDetails").val());
  },
  'keyup #wiAssigneeInput' : function(e) {
    if (e.keyCode == '13') {
      // update the collection
      var user = Meteor.users.findOne({uniqueName: e.target.value});
      if (user != null) {
        WorkItems.update(WorkItemDialog.currentWiId, {$set: {assignee: user}});
        WorkItemDialog.renderAssignee();
      }
    }
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
  $node: null,
  clearDetailsDialogFields: function() {
    $('#wiDetailsDialog input, #wiDetailsDialog textarea').val('');
  },
  getUsersTypeahead: function(value) {
    var foundUsers = Meteor.users.find({uniqueName: new RegExp('^' + value)}).fetch();
    var userArr = [];
    _.each(foundUsers, function(item) {
      userArr = userArr.concat(item.uniqueName);
    });
    return userArr;
  },
  removeLabelFromWi: function(e) {
    var data = $(this).closest("li");
    var labelName = data.attr('data-label-name');
    var wiId = $("#wiDetailsDialog").attr('editing-wi-id');
    WorkItems.update(wiId, {$pull: {labels: {name: labelName}}});
    WorkItems.update(wiId, {$set: {dirty: true}});
    WorkItemDialog.renderWiLabels();
    WorkItemDialog.renderLabelLists();
  },
  removeLinkFromWi: function(e) {
    var linkId = $(this).closest("li").attr("data-link-id");
    Links.remove(linkId);    
    WorkItemDialog.renderWiLinks();
  },
  removeAssignee: function(e) {
    WorkItems.update(WorkItemDialog.currentWiId, {$set: {assignee: null}});
    WorkItemDialog.renderAssignee();
  },
  renderSidebar: function(title, body) {
    if (title === undefined || body === undefined) {
      // Just clear the sidebar
      this.$node.find("#sidebar-title, #sidebar-body").empty();
      return;
    }
    var titlefrag = Meteor.render(Template.sidebarTitle({title: title}));
    this.$node.find("#sidebar-title").empty().append(titlefrag);

    var bodyfrag = Meteor.render(Template.sidebarPreview({body: body}));
    this.$node.find("#sidebar-body").empty().append(bodyfrag);
  },
  renderWiLabels: function() {
    var wi = WorkItems.findOne(WorkItemDialog.currentWiId);
    var labels = wi.labels;
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
  renderStageAssigneeList: function() {
    var i = 0;
    var assigneeList = _.map(wi.assignee_list, function(person) {
      return {name: person, num: i++};
    });

    // Populate this popover with the labels
    var listHtml = Meteor.render(Template.assigneeStagesList({people: assigneeList }));
    $assigneeWrapper = $('#assignee-stages-wrapper');
    $assigneeWrapper.empty();
    $assigneeWrapper.append(listHtml);
  },
  renderStatus: function() {
    var statusHtml = Meteor.render(Template.wiDialogStatus({wiId: WorkItemDialog.currentWiId}));
    $("#workitem-status-wrapper").empty();
    $("#workitem-status-wrapper").append(statusHtml);
    Template.wiDialogStatus.setupEvents();
  },
  renderWorkItemNumber: function(wi) {
    var number = wi.number;
    if (typeof number == typeof Number()) 
      this.$node.find("#workitem-dialog-number").html("#" + number);
    else
      return;
  },
  showWiDialog: function(id) {
    this.$node = $("#wiDetailsDialog");
    wi = WorkItems.findOne(id);
    WorkItemDialog.currentWiId = id;
    WorkItemDialog.renderWiLabels();
    WorkItemDialog.renderWiLinks();
    WorkItemDialog.renderLabelLists();
    WorkItemDialog.renderStageAssigneeList();
    WorkItemDialog.renderStatus();
    WorkItemDialog.renderWorkItemNumber(wi);
    WorkItemDialog.renderSidebar(defines.PREVIEW_TITLE, this.$node.find("#wiDescDetails").val());
    WorkItemDialog.renderAssignee();
    $("#wiAssigneeInput").typeahead({
      source: function(query) {
        this.process(WorkItemDialog.getUsersTypeahead(query));
      },
      minLength: 1
    });
    $('#wiNameDetails').val(wi.name).autosize();
    $('#wiDescDetails').val(wi.description).autosize();
    this.$node.attr('editing-wi-id', id);
    this.$node.modal({dynamic: true, keyboard: true}).on("hidden", $.proxy(function() {
      if (this.$node.css("display") === "none"){
        workboard.userStopEditingItem(id);
        WorkItemDialog.currentWiId = null;
      }
    }, this));
  },
  renderAssignee: function() { 
      this.$node.find(".wi-assignee-item").remove();
      var assignee = WorkItems.findOne(WorkItemDialog.currentWiId).assignee;
      if (assignee != null) { 
        var frag = Meteor.render(Template.dialogAssigneePerson(assignee));
        this.$node.find("#wiAssigneeInput").after(frag);
        this.$node.find(".wi-assignee-item li a.delete").click(WorkItemDialog.removeAssignee);
      }
  },
  labelClicked: function(e) {
    var labelName = $(this).attr('data-label-name');
    var label = Labels.findOne({repo_id: Session.get("currentRepoId"), 'name': labelName});
    
    // Meteor doesn't support $addToSet so we have to find and then add if
    // doesn't exist
    if (!WorkItems.findOne({_id: WorkItemDialog.currentWiId, labels: label})){
      WorkItems.update(WorkItemDialog.currentWiId, {$push: {labels: label}});
      WorkItems.update(WorkItemDialog.currentWiId, {$set: {dirty: true}});
    }
    WorkItemDialog.renderWiLabels();
    WorkItemDialog.renderLabelLists();
  }
}