//This human player unit should have everything the standard unit does, but will not have predifined moves in the take_turn command.
//The player will have events listening for button press.
//Also, mouse events

function human_unit(colour, coords) {
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
    this.hits_this_turn = 0, //number of times this unit has hit an enemy. If it's equal to the maximum set in game settings, then turn is over
    this.turn_going = true,
    this.player_order = null,
    this.closest_enemy = null,
    this.current_action = null, //Can be attack or move
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
                } else 
                if(players[i].units[j].current_pos[0] == potential_target_pos[0] && players[i].units[j].current_pos[1] == potential_target_pos[1]){
                    vacant_space = false
                }
            }
        }
        //Any obstacles here?
        for (var k = 0; k < obstacles_collection.obstacles.length; k++){
            if(obstacles_collection.obstacles[k].current_pos[0] == potential_target_pos[0] && obstacles_collection.obstacles[k].current_pos[1] == potential_target_pos[1]){
                vacant_space = false
                obstacle = obstacles_collection.obstacles[k]
            }
        }
        return [vacant_space, obstacle]
    },
    this.update_target_pos_if_vacant = function(potential_target_pos){
        //Keep as is, I believe
        console.log('I am at', this.current_pos, 'moving to', potential_target_pos, 'if it is vacant')
        var results = this.check_square_vacancy(potential_target_pos) 
        var vacant = results[0]
        var obstacle = results[1]
        if (vacant == true){
            this.target_pos = potential_target_pos;
        } else if (obstacle != null){
            console.log('obstacle there')
        }
    },
    this.get_new_target_pos = function(player_order){
        //Keep, but alter heavily - the human player does not care which enemy is the closest. Maybe I can replace this entirely
        console.log('Order to move')
        function set_potential_target(current_pos, spaces_per_move, order_x, order_y){
            var init_x = current_pos[0] + (order_x * spaces_per_move)
            var init_y = current_pos[1] + (order_y * spaces_per_move)
            return [init_x, init_y]
        }
        var order_x = player_order[0]
        var order_y = player_order[1]
        var potential_target_pos = set_potential_target(this.current_pos, this.spaces_per_move, order_x, order_y)
        this.update_target_pos_if_vacant(potential_target_pos)
    },
    this.move = function(){ //Only handles the animations between moves. When the unit reaches its target, it acquires a new target
        //Keep the same
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
        //Remove this, I believe
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
        //Either remove, or heavily alter this function
        if (this.player_order != null && this.moves_this_turn == 0){
            this.get_new_target_pos(this.player_order)
            this.player_order = null
        }
        this.moves_this_turn ++
        if (this.moves_this_turn < this.spaces_per_move){
            this.move()
        } else {
            this.current_action = null
            this.turn_going = false
            this.moves_this_turn = 0
            this.recentre_player()
        }
        return
    },
    this.recentre_player = function(){
        var x_current = this.current_pos[0] / this.spaces_per_move
        var y_current = this.current_pos[1] / this.spaces_per_move
        var x_true = Math.round(x_current) * this.spaces_per_move
        var y_true = Math.round(y_current) * this.spaces_per_move
        this.current_pos[0] = x_true
        this.current_pos[1] = y_true
    },
    this.attack_enemy = function(closest_enemy){
        //Remove this, the projectiles themselves do the firing. The player fires the projectiles.
        closest_enemy.hit_points -= this.attack_points
        closest_enemy.update_radius()
    },  
    this.attack_obstacle = function(obstacle){
        //Remove, the player does not attack obstacles
        obstacle.hit_points -= this.attack_points
        obstacle.update_width()
    },
    this.check_closest_enemy = function(this_enemy, closest_enemies, shortest_long_side){
        //Remove this, player does not care which enemy is closest
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
            return [closest_enemies, shortest_long_side]
        }
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
        //Remove this, player does not care which enemy is closest
        var closest_enemies = []
        closest_enemies.push(null)
        var shortest_long_side = 0
        for (var i = 0; i < players.length; i++){
            //Don't include units of the same colour
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