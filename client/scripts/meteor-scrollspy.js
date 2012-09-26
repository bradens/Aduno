Meteor.startup(function () {
  // Holds all the sections in the document
  var sections = [];
  
  // Add the sections
  _.each($('.data-scroll-section'), function(elem){
    sections.push(elem);
  });
  
  for (var i = 0; i < sections.length; i++) {
    sections[i].prev = sections[i-1] || sections[i];
    sections[i].next = sections[i+1] || sections[i];
    $(sections[i]).waypoint({offset: 30});
  }
  
  $('body').delegate('.data-scroll-section', 'waypoint.reached', function (evt, dir) {
    $(".navbar .active").removeClass("active");
    var active = (dir === "up") ? this.prev : this;
    $(".navbar [href='#" + $(active).attr('id') + "']").parent().addClass("active");
  });
});