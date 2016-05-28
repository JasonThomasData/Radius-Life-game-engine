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
                blue_player.create_new_unit([j,i])
            } else if (array_of_lines[i][j] == 'r'){
                red_player.create_new_unit([j,i])
            } else if (array_of_lines[i][j] == 'g'){
                green_player.create_new_unit([j,i])                
            } else if (array_of_lines[i][j] == 'y'){
                yellow_player.create_new_unit([j,i])
            } else if (array_of_lines[i][j] == 'h'){
                human_player.create_new_unit([j,i])
            } else if (array_of_lines[i][j] == 'z'){
                zombie_player.create_new_unit([j,i])
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