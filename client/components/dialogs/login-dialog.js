Template.loginDialog.events = {
    'click .github-login' : function() { 
      Meteor.loginWithGithub({requestPermissions: ['user', 'public_repo']});
    },
    'click .login-dialog-login' : function(e) {
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
};