var path = require('path');

const Configuration = {
    MaxNumberOfGames: 0xFF,
    MaxNumberOfPlayers: 8,
    // App configuration
    ListeningPort: process.env.port  || 8888,           // 8888 when testing locally
    StaticResourcesPath: path.join(__dirname, '../static')  // Where to look for html and client js files 
}

module.exports = {
    Configuration: Configuration
}