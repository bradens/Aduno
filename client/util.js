/**
 * util.js
 * Aduno project (http://aduno.meteor.com)
 * @author Braden Simpson (@bradensimpson)
 * 
 * Utility methods.
 */

// returns a jQuery object suitable for setting scrollTop to
// scroll the page, either directly for via animate()
var scroller = function() {
  return $("html, body").stop();
};

// Very hacky way to get the login callback..
// Eventually use 
//function loginCallback() {
//  workflow && workflow.loggedIn();
//}

/**
 * Taken from this stackoverflow
 * http://stackoverflow.com/questions/5560248/programmatically-lighten-or-darken-a-hex-color
 */
function LightenDarkenColor(col,amt) {
  var usePound = false;
  if ( col[0] == "#" ) {
      col = col.slice(1);
      usePound = true;
  }
  var num = parseInt(col,16);
  var r = (num >> 16) + amt;
  if ( r > 255 ) r = 255;
  else if  (r < 0) r = 0;
  var b = ((num >> 8) & 0x00FF) + amt;
  if ( b > 255 ) b = 255;
  else if  (b < 0) b = 0;
  var g = (num & 0x0000FF) + amt;
  if ( g > 255 ) g = 255;
  else if  ( g < 0 ) g = 0;
  return (usePound?"#":"") + (g | (b << 8) | (r << 16)).toString(16);
}

Handlebars.registerHelper('iter', function(context, options) {
  var fn = options.fn, inverse = options.inverse;
  var ret = "";

  if(context && context.length > 0) {
    for(var i=0, j=context.length; i<j; i++) {
      ret = ret + fn(_.extend({}, context[i], { i: i, iPlus1: i + 1 }));
    }
  } else {
    ret = inverse(this);
  }
  return ret;
});

function scrollto(selector)
{
  scroller().animate({
        scrollTop: $(selector).offset().top
    }, 500, 'swing');  
}

function scrollToBottom(elm_id) {
  var elm = document.getElementById(elm_id);
  try {
    elm.scrollTop = elm.scrollHeight;
  }
  catch(e) {
    var f = document.createElement("input");
    if (f.setAttribute) f.setAttribute("type","text")
    if (elm.appendChild) elm.appendChild(f);
    f.style.width = "0px";
    f.style.height = "0px";
    if (f.focus) f.focus();
    if (elm.removeChild) elm.removeChild(f);
  }
}