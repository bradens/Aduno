/**
 * auth-dialog.js
 * Aduno project (http://aduno.meteor.com)
 * @author Braden Simpson (@bradensimpson)
 * 
 * Authentication ui code
 * @todo @bradens use a mixin with other dialog code if there gets to be 
 * redundancy
 */
Template.authDialog.events = {
	'click .authDialogOK' : function(e) {
		dialog = $("#authDialog");
		usr = dialog.find("#authUsername").val();
		pwd = dialog.find("#authPass").val();
		Meteor.call('auth', Session.get('user_id'), usr, pwd);
		$('#authDialog input, #wiDetailsDialog textarea').html('');
		$('#authDialog').modal("hide");
	}
};