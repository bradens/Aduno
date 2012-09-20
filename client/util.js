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

function scrollto(selector)
{
	$('html, body').animate({
        scrollTop: $(selector).offset().top
    }, 500);	
}