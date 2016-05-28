var players_all = []

function randomise_players(){
    var temp_players = []
    while (players_all.length > 0){
        var i = Math.floor(Math.random() * (players_all.length))
        temp_players.push(players_all[i])
        players_all.splice(i, 1)
    }
    players_all = temp_players    
}

//TODO - place this inside the map generator. If a g is detected, generator green_player

var green_player = new player_object('#00cc00', 'standard')
var yellow_player = new player_object('#ffcc00', 'standard')
var blue_player = new player_object('#0066cc', 'standard')
var red_player = new player_object('#e62e00', 'standard')
var human_player = new player_object('#336699', 'player')
var zombie_player = new player_object('#669900', 'standard')

randomise_players()