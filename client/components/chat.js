    Template.chat_header.signined_name = function () {
        return Session.get('signined_name')
    };

    Template.chat_header.events = {
        'click button.btn': function () {
            Session.set('signined_name', $('#name').val());
        }
    };

    Template.chat_inputarea.signined_name = function () {
        return Session.get('signined_name')
    };


    Template.chat_inputarea.events = {
        'keydown input.#message': function (e) {
            if(e.keyCode == 13) {
              Messages.insert({repo_id: Session.get('currentRepoId'), name:Session.get('signined_name'), message:$('#message').val(), at: new Date()});
               //Messages.insert({name:Session.get('signined_name'), message:$('#message').val(), at: new Date()});
              $('#message').val('');
            }
        }
    };


    Template.chat_content.messages = function () {
        return Messages.find({repo_id: Session.get('currentRepoId')}, {sort:{at: -1}});
    };
