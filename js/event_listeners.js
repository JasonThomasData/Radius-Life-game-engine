//Detects arrow keys, updates object's details accordingly
//Have not implemented player functions.
function update_position(key_event) {
    if (key_event == 37){
        human_player.units[0].player_order = [-1,0]
    } else if (key_event == 38){
        human_player.units[0].player_order = [0,-1]
    } else if (key_event == 39){
        human_player.units[0].player_order = [1,0]
    } else {
        human_player.units[0].player_order = [0,1]
    }
}

//listens for keyboard events, doesn't call the update function unless key down is an arrow event
document.addEventListener('keydown', function(event) {
    if (event.which >= 37 && event.which <= 40){
        update_position(event.which)
    } else if (event.which == 32){
        clearInterval(logic_loop)
    }
}, false);