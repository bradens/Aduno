Template.loginDialog.events = {
    'click .github-login' : function() { 
      Meteor.loginWithGithub({requestPermissions: ['user', 'public_repo']});
      $("#login-dialog").modal('hide');
    },
    'click .login-dialog-login' : function() {
      Template.loginDialog.login();
    },
    'keyup form' : function(e) {
      if (e.keyCode == 13) {
        Template.loginDialog.login();
      }
    }
};
Template.loginDialog.login = function() {
    // Update Collection
    $dlg = $("#login-dialog");

    var user = $dlg.find("#login-username").val(),
        pass = $dlg.find("#login-password").val();

    Meteor.loginWithPassword(user, pass, function(res) {
      console.log(res);
    });
    $('#login-dialog input').val("");
    $dlg.modal("hide");
}
