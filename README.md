#Aduno#
###_To Unite, To Make One_###

###Dev Environment Setup###
####Install node####
Follow instructions [here](http://nodejs.org).

####Install meteor####
`curl install.meteor.com | sh`

###Install meteorite 

    npm install -g meteorite
    
if you have problems, check out the installation [instructions](https://github.com/oortcloud/meteorite)

####Install Aduno####
Now just clone aduno  

    git clone git://github.com/bradens/Aduno.git
    cd aduno
    mrt
    
This will create a mongodb instance, so it could take a minute or two the first try, then

    http://localhost:3000
    
and it should work!

####Setup github auth####
In order to set up a github auth key (required for testing out your aduno instance), you have to do the following.

**Register github app**

Go to https://github.com/settings/applications and click *Register new app*
Register a new application and point 

    url = http://localhost:3000
    callback url = http://localhost:3000/_oauth/github?close
    
Then copy your clientId and secret into the *Configure github auth* dialog that pops up when trying to sign in.
This only has to be done once per mongodb reset (only once unless you mess something up)

Contact me @bradensimpson on twitter for any questions.
