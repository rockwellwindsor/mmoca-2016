# MMoCA 2016 
Version of the code from the TheoryThree and Chapa Design teams submission to Design MMoCA's 2016 biennial event.

This is a color version where line color, shadow for x and y are generated randomly on page load.

## Technologies
* nodeJS
* webaudio API

## Structure
* public 
    * css - Holds any css files needed for styling.  
    * img - The file in here (bg-black.png) is set as the background of the canvas.  If the screenshot functionality is being used this needs to be set as the background, otherwise the background appears as white.  
    * js - Holds the required javascript files needed for the application to run.
    * vendor -  Contains 3rd party libraries that may be used in further development.
* server
    * views
        * color.html - This is the html file to render the canvas.
* index.js - Handles app startup.
* Procfile - Declares what commands should be run by Heroku dynos when starting application.

## What it does
This application takes input from a microphone and draws on a canvas based on the notes recieved.  The notes are an approximation. The lines are also an approximation.  A grid system is laid out, and then notes are drawn from one area to another, but they are drawn to an approximate area within a range, not an exact location.
