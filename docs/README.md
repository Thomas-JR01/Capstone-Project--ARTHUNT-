# Table of Contents
* [Introduction](#introduction)
* [Install](#install)
* [Testing](#testing)
* [Contributors](#contributors)

# Introduction 
In the Art Hunt, a number of teams compete in real-time to locate artworks and
artefacts around the city. They locate sites, take a team photo at the site, and
upload it with other details to earn points. Their submissions are checked, partly
automatically and partly manually, and points are allocated. The system is very
dynamic, and points change throughout the game based on team behaviour and
timers; for example, teams can win or lose points depending on whether they are
correct or incorrect, they can trade points, and they can earn strategy points. Site
and team points grow over time depending on different factors. The Art Hunt is
designed to have no obvious winning strategy, and encourages teams to
experiment with quite different strategies.

# Install
## All
* NodeJS (developed on v16.3.0)
## Server
* Express (developed on v4.16.1)
* Mongo (developed on v4.4.6)
## Admin
* Angular (developed on v12.0.3)
## Client
* Angular (developed on v12.0.3)

For a detailed software installation guide see the [INSTALL](INSTALL.md) file.

# Testing
## Server
* Run `npm start` in the `/server` directory to start the server
* Should be running on `localhost:3000`
## Admin
* Run `ng serve` in the `/admin` directory
* Should be running on `localhost:3100`
## Client
* Run `ng serve` in the `/client` directory
* Should be running on `localhost:3200`

# Contributors
Developed by George Hickey & QUT 2021 Capstone Team PYYT.  
However, all project ownership rights belong to George Hickey. 
## PYYT
* Thomas Rogencamp
* Nghia Ly 
* Matthew Docherty
* Daniel Abbott