var app = require('../app/app');        // All the app, server and network initialization is on this module
var config = require('../config/configuration');
var crypto = require('crypto');
var _ = require('underscore');


const GameState = {
    Initializing: 0,
    WaitingInLobby: 1,
    Playing: 2,
    Finished: 3
}

const GameError = {
    Success: 'Operation was successful',
    InvalidSocketIOServer: 'Invalid SockectIO server',
    MaxNumberOfGamesReached: 'Maximum number of games reached',
    MaxNumberOfPlayersReached: 'Maximum number of players reached' 
}

function GameReturn(result, error, ...output) {
    return {result, error, output};
}

/**
 * A class encapsulating the core logic of a game
 */
class Game {
    constructor(name, maxNumberOfPlayers) {
        this.state = GameState.Initializing
        this.name = name;
        this.maxNumberOfPlayers = maxNumberOfPlayers;
        this.players = {};

        // Networking properties
        this.nsp = null;    // Bridge with socket io (implemented as a namespace)
    }

    get numberOfPlayers() {
        return Object.keys(this.players).length;
    }

    get canAddNewPlayer() {
        return this.numberOfPlayers < this.maxNumberOfPlayers;
    }

    player(id) {
        return this.players[id];
    }


    /**
     * Returns true if a player is properly formed
     * @param {Player} player Checks for the player's id and name
     */
    isValidPlayer(player) {
        return (player) && 
            (player instanceof Player) &&
            (!_.isEmpty(player.id.trim())) &&
            (!_.isEmpty(player.name.trim()))
    }

    /**
     * Adds a player to the game's roster.
     * Returns true if the player is valid and can be added, that is
     * - The maximum number of player for this game has not been reached
     * - The player has not been previously added
     * @param {Player} player, T 
     */
    addPlayer(player) {
        
        if ((this.isValidPlayer(player)) &&
            (this.canAddNewPlayer) &&
            (!(player.id in this.players))) {
                this.players[player.id] = player;
                player.state = PlayerState.Waiting;
                return true;
        }

        return false;
    }

    /**
     * Configures the namespace
     */
    bindToSocket() {
        this.nsp = app.io.of('/game'.concat(this.id));

        nsp.on('connection', function(socket) {
            console.log('On '+this.name+' '+socket.id + " connected");
            socket.on('new player', function(data) {
            
                // we cna have 2 cases here
                // a new player is to be added
                // or a player that had been added is re-trying to join?

                // new player:
                // note the delegator should've checked if this game
                // could add an extra player
                if (!(socket.id in players)) {
                    if(this.canAddNewPlayer()) {
                        // by default a new player is in the waiting state
                        addPlayer(new Player(socket.id,data.name,300,300));
                    } else {
                        // reject the connection
                        socket.close();
                    }
                } else {
                    // The player tried to join again
                    // this can happen due to connection lost
                    // in this case update the player with the new data
                    // but leave it in a waiting state

                    players[socket.id].state = PlayerState.Waiting;
                    players[socket.id].name = data.name;
                }
            });
            socket.on('movement', function(data) {
              var player = players[socket.id] || {};
              if (data.left) {
                player.x -= 5;
              }
              if (data.up) {
                player.y -= 5;
              }
              if (data.right) {
                player.x += 5;
              }
              if (data.down) {
                player.y += 5;
              }
            });
          
            socket.on('disconnecting', (reason) => {
              console.log('On '+this.name+' '+socket.id + " is disconnecting: " + reason);
              delete players[socket.id];
            });  
          });
    }

}

/**
 * A global dictionary holding all the game rooms
 */
var games = {}

function canAddNewGame()
{
    return Object.keys(games).length < config.Configuration.MaxNumberOfGames;
}

function newGame() {

    // Validate is a sockect io object
    // TODO: enforce is a socket io server
    if (_.isNull(app.io)) {
        return GameReturn(false,GameError.InvalidSocketIOServer);
    }

    // Maximum number of games reached
    if (!canAddNewGame()) {
        return GameReturn(false,GameError.MaxNumberOfGamesReached);
    }

    // assign a new name to the room
    var id = '';
    do {
        var id = crypto.randomBytes(20).toString('hex');
        if (!(id in games)) { break; }
    } while (true);
    
    games[id] = new Game(id, config.Configuration.MaxNumberOfPlayers);
    
    return GameReturn(true, GameError.Success,id);
}


const PlayerState = {
    Waiting: 0,     // The player is in the lobby or as a current game spectator
    Playing: 1,
    Destroyed: 2,   // The player has been defeated
    Pinging: 3,     // Special state to put the player in case of communication lost
}

class Player {
    constructor(id,name,x,y) {
        this.state = PlayerState.Waiting;
        this.id = id;
        this.name = name;
        this.x = x;
        this.y = y;
    }
}


// Exports
module.exports = {
    Game: Game,
    GameState: GameState,
    Player: Player,
    canAddNewGame,
    newGame,
    games
}
