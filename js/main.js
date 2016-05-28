//The loop that loops through all players, then loops through all of each player's units, and moves them
//Each unit gets to move a pixel, or whatever the speed is set to, if the unit belongs to the player whose turn it is currently.
var logic_loop = setInterval(function(){
    var i = game_settings.turn
    obstacles_collection.remove_destroyed()
    player_remove_dead(players_all[i])
    if (players_all[i].units.length > 0){
        player_all_units_move(players_all[i])
    } else {
        game_settings.turn ++
        if (i >= players_all.length - 1){
            game_settings.turn = 0
        } 
    }
}, game_settings.between_loops)


//Initialises canvas
var canvas = document.getElementById("canvas");
canvas.width = game_settings.canvas.width //These sizes will be overwritten when the file is uploaded
canvas.height = game_settings.canvas.height
var ctx = canvas.getContext("2d");

//Updates the canvas - places each object in relation to its current coords
function draw(){
    ctx.clearRect(0, 0, canvas.width, canvas.height); //clears canvas
    //Place all units
    for (var i = 0; i < players_all.length; i++){
        for (var j = 0; j < players_all[i].units.length; j++){
            if (players_all[i].units[j].radius > 0){
                ctx.beginPath();
                var player_x = players_all[i].units[j].current_pos[0] + game_settings.units.spaces_per_move / 2
                var player_y = players_all[i].units[j].current_pos[1] + game_settings.units.spaces_per_move / 2
                var player_radius = players_all[i].units[j].radius + players_all[i].units[j].min_radius
                ctx.arc(player_x, player_y, player_radius, 0, 2 * Math.PI)
                ctx.fillStyle = players_all[i].colour
                ctx.fill()                
            }
        }
    }
    for (var k = 0; k < obstacles_collection.obstacles.length; k++){
        var half_missing_square = (game_settings.obstacles.width - obstacles_collection.obstacles[k].wide) / 2
        ctx.beginPath();
        ctx.rect(obstacles_collection.obstacles[k].current_pos[0] + half_missing_square, obstacles_collection.obstacles[k].current_pos[1] + half_missing_square, obstacles_collection.obstacles[k].wide, obstacles_collection.obstacles[k].wide)
        ctx.fillStyle = game_settings.obstacles.colour
        ctx.fill()
    }
}

//Some games will have the references to AI etc in this loop. I will have mine seperate.
function draw_loop(timestamp) {
    if (timestamp < game_settings.animation.lastFrameTimeMs + (1000 / game_settings.animation.maxFPS)) {
        requestAnimationFrame(draw_loop);
        return;
    }
    game_settings.animation.lastFrameTimeMs = timestamp;
    draw();
    requestAnimationFrame(draw_loop);
}
requestAnimationFrame(draw_loop);