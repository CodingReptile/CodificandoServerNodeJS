var app = require('../app/app');
var express = require('express');
var gameModel = require('../model/game');
var _ = require('underscore');

var Enumerable = require('linq');

function checkConditionForGame(game, name, query) {
    
    var doesItMatchGameName = (name) ? game.name === name : true;
    var isQueryPresent = ((query) && !_.isEmpty(query));
    var isLookingForAvailableGames = !(_.isUndefined(query.available));

    var check = 
        doesItMatchGameName &&
        (isQueryPresent ? 
            (isLookingForAvailableGames ? 
                query.available === game.canAddNewPlayer : 
                true)
            : true)
        ;
    
    return check;
}

function lookupGameInternal(name, query) {
    
    var filteredGames = Enumerable.from(gameModel.games)
        .where(kvp =>  checkConditionForGame(kvp.value, name, query))
        .select(kvp => kvp.value)
        .toArray();
    
    return filteredGames;
}

function lookupGame(req, res, next) {
    // We access the ID param on the request object
    var name = req.params.name;
    
    // We access the query
    var query = req.query;
    
    var games = lookupGameInternal(name, query); 

    if (_.isEmpty(games))
    {
        // fail the request,
        // no games where found that satisfied the
        // constraints
        res.statusCode = 404;
        return res.json({ errors: ['Game not found'] });
    }
    
    var result = {}

    // By attaching the games
    req._games = games
    next();
}

// Custom router
var expressApp = express();
expressApp.set("json replacer", ["name", "maxNumberOfPlayers", "players", "state"])
expressApp.get('/', lookupGame, function(req, res) { res.statusCode = 200; res.json(req._games); });
expressApp.get('/:name', lookupGame, function(req, res) { res.statusCode = 200; res.json(req._games); });

const apiName = '/game'

// Set routing for model apis
app.app.use(apiName, expressApp);