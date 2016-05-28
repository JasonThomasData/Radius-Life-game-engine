function player_create_new_unit(player, coords){
    if(player.player_type == 'standard'){
        var new_unit = new unit(player.colour, coords);            
    } else if (player.player_type == 'player'){
        var new_unit = new unit(player.colour, coords);
    }
    player.units.push(new_unit)
}

function player_human_units_move(player){
    for (var i = 0; i < player.units.length; i++){
        if (player.units[i].turn_going == true){
            unit_human_take_turn(player.units[i])
        }
    }
    player_check_moves(player)
}

function player_standard_units_move(player){
    for (var i = 0; i < player.units.length; i++){
        if (player.units[i].turn_going == true){
            unit_take_turn(player.units[i])
        }
    }
    player_check_moves(player)
}

function player_all_units_move(player){
    if(player.player_type == 'standard'){
        player_standard_units_move(player)
    } else {
        player_human_units_move(player)
    }
}

function player_remove_dead(player){
    for (var i = 0; i < player.units.length; i++){
        if (player.units[i].hit_points <= 0){
            console.log(player.units[i].current_pos, ' died')
            player.units.splice(i,1)
        }
    }
}

//Every unit gets one action each. Each unit has a callback for when an action is complete. That calls this function, and adds one to the tally. If the tally equals the number of units, then that player's units have all moved. The logic loop will now target the next player
function player_reset_units(player){
    for (var i = 0; i < player.units.length; i++){
        player.units[i].turn_going = true
    }
}

function player_check_moves(player){
    var going = 0
    for (var i = 0; i < player.units.length; i++){
        if (player.units[i].turn_going == true){
            going ++
        }
    }
    if (going == 0){
        player_reset_units(player)
        if (game_settings.turn == players_all.length -1){
            game_settings.turn = 0
        } else {
            game_settings.turn ++
        }
    }
}