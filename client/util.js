/**
 * util.js
 * Aduno project (http://aduno.meteor.com)
 * @author Braden Simpson (@bradensimpson)
 * 
 * Utility methods.
 */
function randomLabel()
{
  var labels = ['', 'label-success', 'label-warning', 'label-important', 'label-info', 'label-inverse'];
  return labels[Math.round((Math.random()*6))];
}

// returns a jQuery object suitable for setting scrollTop to
// scroll the page, either directly for via animate()
var scroller = function() {
  return $("html, body").stop();
};

function scrollto(selector)
{
  scroller().animate({
        scrollTop: $(selector).offset().top
    }, 500, 'swing');  
}