Template.userCreateDialog.events = {
	'click .btn-ok': function() {
		$dlg = $("#user-create-dialog");
		name = $dlg.find("#realName").val();
		username = $dlg.find("#username").val();
		password = $dlg.find("#password").val();
		email = $dlg.find("#email").val();
		Meteor.call("createAccount", {
			profile: {name: name},
			username: username, 
			password: password,
			email: email}
		);
		$dlg.modal('hide');
	}
};