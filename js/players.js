var players = []

function player_object(colour, unit_type){
    this.colour = colour,
    this.units = [],
    this.actions = 0,
    this.unit_type = unit_type,
    this.init = function(){
        players.push(this)
    },
    this.create_new_unit = function(coords){
        if(this.unit_type == 'standard'){
            var new_unit = new unit(colour, coords);            
        } else if (this.unit_type == 'player'){
            var new_unit = new human_unit(colour, coords);
        }
        this.units.push(new_unit)
    },
    this.units_move = function(){
        //this.remove_dead()
        for (var i = 0; i < this.units.length; i++){
            if (this.units[i].turn_going == true){
                this.units[i].take_turn()
            }
        }
        this.check_moves()
    },
    this.remove_dead = function(){
        for (var i = 0; i < this.units.length; i++){
            if (this.units[i].hit_points <= 0){
                console.log(this.units[i].current_pos, ' died')
                this.units.splice(i,1)
            }
        }
    },
    //Every unit gets one action each. Each unit has a callback for when an action is complete. That calls this function, and adds one to the tally. If the tally equals the number of units, then that player's units have all moved. The logic loop will now target the next player
    this.reset_units = function(){
        for (var i = 0; i < this.units.length; i++){
            this.units[i].turn_going = true
        }
    },
    this.check_moves = function(){
        var going = 0
        for (var i = 0; i < this.units.length; i++){
            if (this.units[i].turn_going == true){
                going ++
            }
        }
        if (going == 0){
            this.reset_units()
            if (game_settings.turn == players.length -1){
                game_settings.turn = 0
            } else {
                game_settings.turn ++
            }
        }
    },
    this.init()
}

function randomise_players(){
    var temp_players = []
    while (players.length > 0){
        var i = Math.floor(Math.random() * (players.length))
        temp_players.push(players[i])
        players.splice(i, 1)
    }
    players = temp_players    
}

var green_player = new player_object('#00cc00', 'standard')
var yellow_player = new player_object('#ffcc00', 'standard')
var blue_player = new player_object('#0066cc', 'standard')
var red_player = new player_object('#e62e00', 'standard')

var zombie_player = new player_object('#669900', 'standard')

randomise_players()