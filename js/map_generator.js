function size_the_board(array_of_lines){
    canvas.width = array_of_lines[0].length * game_settings.units.spaces_per_move
    canvas.height = array_of_lines.length * game_settings.units.spaces_per_move
}

//Reads the text passed to it from the file reader, places units and obstacles
function populate_board(board){
    var array_of_lines = board.match(/[^\r\n]+/g);
    for (var i = 0; i < array_of_lines.length; i++){
        for (var j = 0; j < array_of_lines[i].length; j++){
            if (array_of_lines[i][j] == 'b'){
                player_create_new_unit(blue_player, [j,i]) 
            } else if (array_of_lines[i][j] == 'r'){
                player_create_new_unit(red_player, [j,i]) 
            } else if (array_of_lines[i][j] == 'g'){
                player_create_new_unit(green_player, [j,i])               
            } else if (array_of_lines[i][j] == 'y'){
                player_create_new_unit(yellow_player, [j,i])
            } else if (array_of_lines[i][j] == 'h'){
                player_create_new_unit(human_player, [j,i])
            } else if (array_of_lines[i][j] == 'z'){
                player_create_new_unit(zombie_player, [j,i])
            } else if (array_of_lines[i][j] == 'o'){
                obstacles_collection.create_new_obstacle([j,i])
            }            
        }
    }
    size_the_board(array_of_lines)
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