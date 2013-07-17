/**
 * config-dialog.js
 * Aduno project (http://aduno.braden.in)
 * @author Braden Simpson (@bradensimpson)
 * 
 * Authentication ui code
 * @todo @bradens use a mixin with other dialog code if there gets to be 
 * redundancy
 */
Template.configDialog.events = {
  'click .configOk' : function(e) {
    dialog = $("#configDialog");
    client = dialog.find("#configClientKey").val();
    secret = dialog.find("#configSecret").val();

    configuration = {
    	service: 'github',
    	clientId: client,
    	secret: secret
    };

    Meteor.call('configureLoginService', configuration, function(err, res) {
    	if (err) console.log("Error : " + err);
    });

    $('#configDialog input').html('');
    $('#configDialog').modal("hide");
  }
};