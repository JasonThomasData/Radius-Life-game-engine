//The basic components of this game engine (or the one I intend to make) are - 
//  An animation loop - update the canvas according to the object's locations, game settings etc
//  Logic loop - controls where the enemies are etc
//  Listen for user interaction - principally to allow users to control the unit object

//Initialises canvas
var canvas = document.getElementById("canvas");
canvas.width = game_settings.canvas.width //These sizes will be overwritten when the file is uploaded
canvas.height = game_settings.canvas.height
var ctx = canvas.getContext("2d");

//Updates the canvas - places each object in relation to its current coords
function draw(){
    ctx.clearRect(0, 0, canvas.width, canvas.height); //clears canvas
    //Place all units
    for (var i = 0; i < players.length; i++){
        for (var j = 0; j < players[i].units.length; j++){
            if (players[i].units[j].radius > 0){
                ctx.beginPath();
                ctx.arc(players[i].units[j].current_pos[0] + game_settings.units.spaces_per_move / 2, players[i].units[j].current_pos[1] + game_settings.units.spaces_per_move / 2, players[i].units[j].radius + players[i].units[j].min_radius, 0, 2 * Math.PI)
                ctx.fillStyle = players[i].colour
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

//The loop that loops through all players, then loops through all of each player's units, and moves them
//Each unit gets to move a pixel, or whatever the speed is set to, if the unit belongs to the player whose turn it is currently.
var logic_loop = setInterval(function(){
    var i = game_settings.turn
    obstacles_collection.remove_destroyed()
    players[i].remove_dead()
    if (players[i].units.length > 0){
        players[i].units_move()
    } else {
        game_settings.turn ++
        if (i >= players.length - 1){
            game_settings.turn = 0
        } 
    }
}, game_settings.between_loops)

function size_the_board(arrayOfLines){
    var canvas_width = arrayOfLines[0].length * game_settings.units.spaces_per_move
    var canvas_height = arrayOfLines.length * game_settings.units.spaces_per_move
    canvas.width = arrayOfLines[0].length * game_settings.units.spaces_per_move
    canvas.height = arrayOfLines.length * game_settings.units.spaces_per_move
}

//Reads the text passed to it from the file reader, places units and obstacles
function populate_board(board){
    var arrayOfLines = board.match(/[^\r\n]+/g);
    for (var i = 0; i < arrayOfLines.length; i++){
        for (var j = 0; j < arrayOfLines[i].length; j++){
            if (arrayOfLines[i][j] == 'b'){
                blue_player.create_new_unit([j,i])
            } else if (arrayOfLines[i][j] == 'r'){
                red_player.create_new_unit([j,i])
            } else if (arrayOfLines[i][j] == 'g'){
                green_player.create_new_unit([j,i])                
            } else if (arrayOfLines[i][j] == 'y'){
                yellow_player.create_new_unit([j,i])
            } else if (arrayOfLines[i][j] == 'o'){
                obstacles_collection.create_new_obstacle([j,i])
            }
        }
    }
    size_the_board(arrayOfLines)
}

//The stuff below manages the query strings, which I will use to save board states
//I could also give people seed codes to spawn new maps, but this seams easier
//To simplify everything, players should receive a code on completion of levels
function get_query_string() {
    var url = window.location.href;
    var query = url.split('?')
    return query[1]
}

function load_doc(file_name) {
  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() {
    if (xhttp.readyState == 4 && xhttp.status == 200) {
        var result = xhttp.responseText
        console.log('Loading map')
        console.log(result)
        populate_board(result)
    }
  };
  xhttp.open("GET", file_name, true);
  xhttp.send();
}
var query_string_value = get_query_string()
var map_location = "maps/" + query_string_value + ".txt"
document.getElementById("pick_map").value = query_string_value
load_doc(map_location)

function on_selection_change(){
    var current_url = window.location.href
    var url_not_query = current_url.split('?')[0]
    var map_location = document.getElementById("pick_map").value;
    var new_url = url_not_query + '?' + map_location;
    window.location.replace(new_url);
}