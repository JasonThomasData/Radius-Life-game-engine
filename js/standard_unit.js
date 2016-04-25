//This is the standard unit. Currently it is very dumb.
//Units move towards their closest enemies and prefer to move vertically (change this so it does either 50/50)
//If they can't get to their closest enemies they will wait behind friendly units or bust down obstacles

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
    this.update_target_pos = function(closest_enemy, x, y){
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
            if (this.attacking_enemy == null){
                clearInterval(logic_loop)
                this.turn_going = false
                return
            } else if (this.check_if_enemy_next_space(this.attacking_enemy) == true){
                this.hits_this_turn ++
                this.current_action = 'attack'
                this.attack_enemy(this.attacking_enemy)
                if (this.hits_this_turn == game_settings.units.hits_per_turn){
                    this.current_action = null
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