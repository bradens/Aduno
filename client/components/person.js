/**
 * person.js
 * Aduno project (http://aduno.meteor.com)
 * @author Braden Simpson (@bradensimpson)
 * 
 * Person template functions
 */
Template.person.getEmail = function () {
  if (this && this.emails)
    return this.emails[0].address;
}