//The basic components of this game engine (or the one I intend to make) are - 
//  An animation loop - update the canvas according to the object's locations, game settings etc
//  Logic loop - controls where the enemies are etc
//  Listen for user interaction - principally to allow users to control the unit object

var game_settings = {
    canvas:{
        width: 0,
        height: 0,
        max_width: 600,
        max_height: 600
    },
    units:{
        radius_per_hp: 0,
        spaces_per_move: 30,
        min_radius: 8,
        speed: 1,
        hit_points: 100,
        attack_points: 1,
        hits_per_turn: 10
    },
    obstacles:{
        width_per_hp: 0,
        min_width: 16,
        width: 0,
        hit_points: 5,
        colour: '#669999'
    },    
    animation:{
        lastFrameTimeMs: 0, // The last time the loop was run
        maxFPS: 60 // The maximum FPS we want to allow
    },
    between_loops: 30, //miliseconds
    turn: 0
}
game_settings.units.radius_per_hp = (game_settings.units.spaces_per_move - game_settings.units.min_radius * 2) / game_settings.units.hit_points * 0.5
game_settings.obstacles.width = game_settings.units.spaces_per_move
game_settings.obstacles.width_per_hp = (game_settings.obstacles.width - game_settings.obstacles.min_width) / game_settings.obstacles.hit_points * 2

function unit(colour, coords) {
    this.get_init_coords = function(coords){
        var init_x = coords[0] * this.spaces_per_move
        var init_y = coords[1] * this.spaces_per_move
        return [init_x, init_y]
    },
    this.min_radius = game_settings.units.min_radius,
    this.colour = colour,
    this.speed = game_settings.units.speed, //the number of pixels this object moves per game loop
    this.spaces_per_move = game_settings.units.spaces_per_move, //the distance this object moves per user interaction, etc
    this.moves_this_turn = this.spaces_per_move,
    this.hits_this_turn = 0,
    this.turn_going = true,
    this.current_action = null,
    this.attacking_enemy = null,
    this.current_pos = this.get_init_coords(coords), //[x,y]
    this.target_pos = this.get_init_coords(coords), //[x,y]
    this.hit_points = game_settings.units.hit_points,
    this.attack_points = game_settings.units.attack_points,
    this.radius = game_settings.units.radius_per_hp * this.hit_points,
    this.update_radius = function(){
        this.radius = game_settings.units.radius_per_hp * this.hit_points
    },
    this.check_square_vacancy = function(potential_target_pos){
        var vacant_space = true
        var obstacle = null
        //Any units here?
        for (var i = 0; i < players.length; i++){
            for (var j = 0; j < players[i].units.length; j++){
                if(players[i].units[j].target_pos[0] == potential_target_pos[0] && players[i].units[j].target_pos[1] == potential_target_pos[1]){
                    vacant_space = false
                } else if(players[i].units[j].current_pos[0] == potential_target_pos[0] && players[i].units[j].current_pos[1] == potential_target_pos[1]){
                    vacant_space = false
                }
            }
        }
        //Any obstacles here?
        
        for (var k = 0; k < obstacles_collection.obstacles.length; k++){
            if(obstacles_collection.obstacles[k].current_pos[0] == potential_target_pos[0] && obstacles_collection.obstacles[k].current_pos[1] == potential_target_pos[1]){
                vacant_space = false
                obstacle = obstacles_collection.obstacles[k]
                //console.log('no vacancy')
                //console.log(potential_target_pos[0] / this.spaces_per_move, potential_target_pos[1] / this.spaces_per_move)
            }
        }
        return [vacant_space, obstacle]
    },
    this.update_target_pos = function(closest_enemy, x, y){
        //console.log(this.current_pos)
        function set_potential_target(get_target_pos){
            var init_x = get_target_pos[0]
            var init_y = get_target_pos[1]
            return [init_x, init_y]
        }
        var x_dif = this.current_pos[0] - closest_enemy.current_pos[0]
        var y_dif = this.current_pos[1] - closest_enemy.current_pos[1]
        var potential_target_pos = set_potential_target(this.target_pos)
        var vacant = false
        var results = []
        if(Math.abs(x_dif) > Math.abs(y_dif)){
            //Put the below stuff inside the check_square_vacancy function - maybe?
            //Also, why is the order to attack coming from the update pos function? Move it to take_turn
            if(x_dif > 0){
                potential_target_pos[0] = this.target_pos[0] - this.spaces_per_move;
                results = this.check_square_vacancy(potential_target_pos) 
                vacant = results[0]
                obstacle = results[1]
//                console.log(potential_target_pos, vacant)
                if (vacant == true){
                    this.target_pos = potential_target_pos;
                } else if (obstacle != null){
                    this.attack_obstacle(obstacle)
                }
            } else {
                potential_target_pos[0] = this.target_pos[0] + this.spaces_per_move;
                results = this.check_square_vacancy(potential_target_pos);
                vacant = results[0]
                obstacle = results[1]
//                console.log(potential_target_pos, vacant)
                if (vacant == true){
                    this.target_pos = potential_target_pos 
                } else if (obstacle != null){
                    this.attack_obstacle(obstacle)
                }
            }
        } else {
            if(y_dif > 0){
                potential_target_pos[1] = this.target_pos[1] - this.spaces_per_move;
                results = this.check_square_vacancy(potential_target_pos);
                vacant = results[0]
                obstacle = results[1]
//                console.log(potential_target_pos, vacant)
                if (vacant == true){
                    this.target_pos = potential_target_pos 
                } else if (obstacle != null){
                    this.attack_obstacle(obstacle)
                }
            } else {
                potential_target_pos[1] = this.target_pos[1] + this.spaces_per_move;
                results = this.check_square_vacancy(potential_target_pos);
                vacant = results[0]
                obstacle = results[1]
//                console.log(potential_target_pos, vacant)
                if (vacant == true){
                    this.target_pos = potential_target_pos 
                } else if (obstacle != null){
                    this.attack_obstacle(obstacle)
                }
            }
        }
    },
    this.move = function(){ //Only handles the animations between moves. When the unit reaches its target, it acquires a new target
        if (this.target_pos[0] > this.current_pos[0]){
            this.current_pos[0] += this.speed;
        } else if (this.target_pos[0] < this.current_pos[0]){
            this.current_pos[0] -= this.speed;
        }
        if (this.target_pos[1] > this.current_pos[1]){
            this.current_pos[1] += this.speed;
        } else if (this.target_pos[1] < this.current_pos[1]){
            this.current_pos[1] -= this.speed;
        }
      
    },
    this.check_if_enemy_next_space = function(closest_enemy){
        var x_dif = Math.abs(closest_enemy.current_pos[0] - this.current_pos[0])
        var y_dif = Math.abs(closest_enemy.current_pos[1] - this.current_pos[1])
        var x_true = (x_dif == (1 * game_settings.units.spaces_per_move))
        var y_true = (y_dif == (1 * game_settings.units.spaces_per_move))
        if (x_true == true && y_dif == 0){
            return true
        } else if (x_dif == 0 && y_true == true){
            return true
        }
        return false
    },
    this.take_turn = function(){
        //This is the condtion that checks if you are next to an enemy, if so, starts attaccking. Otherwise, it finds the nearest enemy and begins moving toward it
        if (this.current_action != 'move') {
            //Add an attacking_enemy property to this object. If it's blank, get a new one. If it's taken, continue attacking.
            this.attacking_enemy = this.find_closest_enemy()
//            if (this.attacking_enemy == null){
//                this.attacking_enemy = this.find_closest_enemy()
//            }
            //If it's null after trying to find enemy, game ends
            if (this.attacking_enemy == null){
//                console.log(this.colour, ' at ', this.current_pos[0]/this.spaces_per_move, this.current_pos[1]/this.spaces_per_move, ' has no enemy')
                clearInterval(logic_loop)
                this.turn_going = false
                return
            } else if (this.check_if_enemy_next_space(this.attacking_enemy) == true){
//                console.log('attacking enemy once')
                this.hits_this_turn ++
                this.current_action = 'attack'
                this.attack_enemy(this.attacking_enemy)
                if (this.hits_this_turn == game_settings.units.hits_per_turn){
                    this.current_action = null
//                    this.attacking_enemy = null
                    this.turn_going = false
                    this.hits_this_turn = 0
                    return
                }
            }
        }
        if (this.current_action != 'attack'){
            if (this.moves_this_turn < this.spaces_per_move){
                this.current_action = 'move'
                this.moves_this_turn ++
                this.move()
            } else {
                var closest_enemy = this.find_closest_enemy()
                if (closest_enemy == null){
//                    console.log(this.colour, ' at ', this.current_pos[0]/this.spaces_per_move, this.current_pos[1]/this.spaces_per_move, ' has no enemy')
                    this.turn_going = false
                }
                this.update_target_pos(closest_enemy,0,0)
                this.current_action = null
                this.turn_going = false
                this.moves_this_turn  = 0
                return
            }
        }
    },
    this.attack_enemy = function(closest_enemy){
        closest_enemy.hit_points -= this.attack_points
        closest_enemy.update_radius()
    },  
    this.attack_obstacle = function(obstacle){
        obstacle.hit_points -= this.attack_points
        obstacle.update_width()
    },
    this.check_closest_enemy = function(this_enemy, closest_enemies, shortest_long_side){
//        console.log(this_enemy.current_pos[0]/this_enemy.spaces_per_move, this_enemy.current_pos[1]/this_enemy.spaces_per_move)
        function find_shortest_long_side(unit_a_pos, unit_b_pos){
            //This is good ol' Pythagorus Theorum. I find the closest enemy by the shortes hypotenuse. If the enemy is directly horizontal or directly higher than the unit, the difference is the longgest side.
            var x_dif = Math.abs(unit_a_pos[0] - unit_b_pos[0])
            var y_dif = Math.abs(unit_a_pos[1] - unit_b_pos[1])
            if (unit_a_pos[0] == unit_b_pos[0]){
                return y_dif
            } else if (unit_a_pos[1] == unit_b_pos[1]){
                return x_dif
            } else {
                var x_dif_sqr = x_dif * x_dif
                var y_dif_sqr = y_dif * y_dif
                return Math.sqrt(x_dif_sqr + y_dif_sqr)
            }
        }
        var this_enemy_shortest_long_side = find_shortest_long_side(this.current_pos, this_enemy.current_pos)
        //If this is the first comparison, this enemy is the closest now
        if (closest_enemies[0] == null){
            closest_enemies[0] = this_enemy
            shortest_long_side = this_enemy_shortest_long_side
//            console.log('This enemy shortest side ', shortest_long_side)
            return [closest_enemies, shortest_long_side]
        }

//        console.log('This enemy shortest side ', this_enemy_shortest_long_side)

//        if (this_enemy_shortest_long_side == shortest_long_side){
//            closest_enemies.push(this_enemy)
//        } else if (this_enemy_shortest_long_side < shortest_long_side){
        if (this_enemy_shortest_long_side == shortest_long_side){
            closest_enemies.push(this_enemy)
        } else if (this_enemy_shortest_long_side < shortest_long_side){
            closest_enemies = []
            closest_enemies.push(this_enemy)
            shortest_long_side = this_enemy_shortest_long_side
        }
        return [closest_enemies, shortest_long_side]        
    },
    this.find_closest_enemy = function(){
        var closest_enemies = []
        closest_enemies.push(null)
        var shortest_long_side = 0
        for (var i = 0; i < players.length; i++){
            //Don't include ants of the same colour
            if (players[i].colour != this.colour && players[i].units.length > 0){
                for (var j = 0; j < players[i].units.length; j++){
                    var results = this.check_closest_enemy(players[i].units[j], closest_enemies, shortest_long_side)
                    closest_enemies = results[0]
                    shortest_long_side = results[1]                    
                }
            }
        }
        var k = Math.floor(Math.random() * closest_enemies.length)
        return closest_enemies[k]
    }
}

//Spawns enemies and you
//TO DO Create an object for each player, and give it an array of units (also objects). Add all player objects to an array of players

var players = []

var obstacles_collection = {
    obstacles: [],
    create_new_obstacle: function(coords){
        var new_obstacle = new obstacle_single(coords)
        this.obstacles.push(new_obstacle)
    },
    remove_destroyed: function(){
        for (var i = 0; i < this.obstacles.length; i++){
            if (this.obstacles[i].hit_points <= 0){
                this.obstacles.splice(i,1)
            }
        }
    }
}

function obstacle_single (coords){
    this.wide = game_settings.obstacles.width,
    this.current_pos = [coords[0] * game_settings.obstacles.width, coords[1] * game_settings.obstacles.width], //[x,y]
    this.hit_points = game_settings.obstacles.hit_points,
    this.colour = game_settings.obstacles.colour,
    this.update_width = function(){
        this.wide = game_settings.obstacles.width_per_hp * this.hit_points
    }
}

function player_object(colour){
    this.colour = colour,
    this.units = [],
    this.actions = 0,
    this.init = function(){
        players.push(this)
    },
    this.create_new_unit = function(coords){
        var new_unit = new unit(colour, coords);
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

var green_player = new player_object('#00cc00')
var yellow_player = new player_object('#ffcc00')
var blue_player = new player_object('#0066cc')
var red_player = new player_object('#e62e00')

function randomise_players(){
    var temp_players = []
    while (players.length > 0){
        var i = Math.floor(Math.random() * (players.length))
        temp_players.push(players[i])
        players.splice(i, 1)
    }
    players = temp_players    
}
randomise_players()

//Detects arrow keys, updates object's details accordingly
//Have not implemented player functions.
function update_position(key_event) {
    if (key_event == 37){
        blue_player.units[0].update_target_pos(-1,0)
    } else if (key_event == 38){
        blue_player.units[0].update_target_pos(0,-1)
    } else if (key_event == 39){
        blue_player.units[0].update_target_pos(1,0)
    } else {
        blue_player.units[0].update_target_pos(0,1)
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
        var half_square = obstacles_collection.obstacles[k].wide / 2
        ctx.beginPath();
        ctx.rect(obstacles_collection.obstacles[k].current_pos[0], obstacles_collection.obstacles[k].current_pos[1], obstacles_collection.obstacles[k].wide, obstacles_collection.obstacles[k].wide)
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
    //var time = new Date()
    //console.log(time)    
    game_settings.animation.lastFrameTimeMs = timestamp;
    draw();
    requestAnimationFrame(draw_loop);
}
requestAnimationFrame(draw_loop);

//The loop that loops through all players, then loops through all of each player's units, and moves them
//Each unit gets to move a pixel, or whatever the speed is set to, if the unit belongs to the player whose turn it is currently.
var logic_loop = setInterval(function(){
    var i = game_settings.turn
    //console.log(i, players.length)
    obstacles_collection.remove_destroyed()
    players[i].remove_dead()
    if (players[i].units.length > 0){
        players[i].units_move()
        //console.log(game_settings.turn )
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

//    if (canvas_width <= game_settings.canvas.max_width){
    canvas.width = arrayOfLines[0].length * game_settings.units.spaces_per_move
//    } else {
//        canvas.width = game_settings.canvas.max_width
//    }

//    if (canvas_height <= game_settings.canvas.max_height){
    canvas.height = arrayOfLines.length * game_settings.units.spaces_per_move
//    } else {
//        canvas.height = game_settings.canvas.max_height
//    }

}

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