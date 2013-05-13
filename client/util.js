/**
 * util.js
 * Aduno project (http://aduno.meteor.com)
 * @author Braden Simpson (@bradensimpson)
 * 
 * Utility methods.
 */

// returns a jQuery object suitable for setting scrollTop to
// scroll the page, either directly for via animate()
this.scroller = function() {
  return $("html, body").stop();
};

/**
 * Taken from this stackoverflow
 * http://stackoverflow.com/questions/5560248/programmatically-lighten-or-darken-a-hex-color
 */
this.LightenDarkenColor = function(col,amt) {
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

this.scrollto = function(selector)
{
  scroller().animate({
        scrollTop: $(selector).offset().top
    }, 500, 'swing');  
}

this.scrollToBottom = function(elm_id) {
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