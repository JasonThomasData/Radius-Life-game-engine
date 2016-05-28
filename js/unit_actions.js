function unit_update_radius(this_unit){
    this_unit.radius = game_settings.units.radius_per_hp * this_unit.hit_points
}

function unit_check_square_vacancy(potential_target_pos){
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
}

function unit_update_target_pos_if_vacant(this_unit, potential_target_pos){
    var results = unit_check_square_vacancy(potential_target_pos) 
    var vacant = results[0]
    var obstacle = results[1]
    if (vacant == true){
        this_unit.target_pos = potential_target_pos;
    } else if (obstacle != null){
        unit_attack_obstacle(this_unit, obstacle)
    }
}

function unit_get_new_target_pos(this_unit, x, y){
    function set_potential_target(get_target_pos){
        var init_x = get_target_pos[0]
        var init_y = get_target_pos[1]
        return [init_x, init_y]
    }
    var x_dif = this_unit.current_pos[0] - this_unit.closest_enemy.current_pos[0]
    var y_dif = this_unit.current_pos[1] - this_unit.closest_enemy.current_pos[1]
    var potential_target_pos = set_potential_target(this_unit.target_pos)
    if(Math.abs(x_dif) > Math.abs(y_dif)){
        //Closest enemy is horizontal
        if(x_dif > 0){
            //Closest enemy is right
            potential_target_pos[0] = this_unit.target_pos[0] - this_unit.spaces_per_move;
        } else {
            //Closest enemy is right                
            potential_target_pos[0] = this_unit.target_pos[0] + this_unit.spaces_per_move;
        }
    } else if(Math.abs(x_dif) < Math.abs(y_dif)){
        //Closest enemy is vertical
        if(y_dif > 0){
            //Closest enemy is above
            potential_target_pos[1] = this_unit.target_pos[1] - this_unit.spaces_per_move;
        } else {
            //Closest enemy is below
            potential_target_pos[1] = this_unit.target_pos[1] + this_unit.spaces_per_move;
        }
    } else {
        //Then, Math.abs(x_dif) == Math.abs(y_dif) - this means the enemy is diagonal
        var random_i = Math.floor(Math.random()* 2)
        console.log(random_i)
        if(y_dif > 0 && x_dif > 0){
            //Emeny is bottom right
            potential_target_pos[random_i] = this_unit.target_pos[random_i] - this_unit.spaces_per_move;
        } else if (y_dif < 0 && x_dif < 0){
           //Emeny is top left
            potential_target_pos[random_i] = this_unit.target_pos[random_i] + this_unit.spaces_per_move;
        } else if (y_dif < 0 && x_dif > 0){
           //Emeny is top right
            if (random_i == 0){
                //Move up
                potential_target_pos[random_i] = this_unit.target_pos[random_i] - this_unit.spaces_per_move;
            } else {
                //Move right
                potential_target_pos[random_i] = this_unit.target_pos[random_i] + this_unit.spaces_per_move;
            }
        } else {
           //Emeny is bottom left
            if (random_i == 0){
                //Move down
                potential_target_pos[random_i] = this_unit.target_pos[random_i] + this_unit.spaces_per_move;
            } else {
                //Move left
                potential_target_pos[random_i] = this_unit.target_pos[random_i] - this_unit.spaces_per_move;
            }
        }
    }
    unit_update_target_pos_if_vacant(this_unit, potential_target_pos)
}

function unit_move(this_unit){ //Only handles the animations between moves. When the unit reaches its target, it acquires a new target
    if (this_unit.target_pos[0] > this_unit.current_pos[0]){
        this_unit.current_pos[0] += this_unit.speed;
    } else if (this_unit.target_pos[0] < this_unit.current_pos[0]){
        this_unit.current_pos[0] -= this_unit.speed;
    }
    if (this_unit.target_pos[1] > this_unit.current_pos[1]){
        this_unit.current_pos[1] += this_unit.speed;
    } else if (this_unit.target_pos[1] < this_unit.current_pos[1]){
        this_unit.current_pos[1] -= this_unit.speed;
    }
}

function unit_check_if_enemy_next_space(this_unit){
    var x_dif = Math.abs(this_unit.closest_enemy.current_pos[0] - this_unit.current_pos[0])
    var y_dif = Math.abs(this_unit.closest_enemy.current_pos[1] - this_unit.current_pos[1])
    var x_true = (x_dif == (1 * game_settings.units.spaces_per_move))
    var y_true = (y_dif == (1 * game_settings.units.spaces_per_move))
    if (x_true == true && y_dif == 0){
        return true
    } else if (x_dif == 0 && y_true == true){
        return true
    }
    return false
}

function unit_take_turn(this_unit){
    //This is the condtion that checks if you are next to an enemy, if so, starts attaccking. Otherwise, it finds the nearest enemy and begins moving toward it
    if (this_unit.current_action != 'move') {
        if (this_unit.closest_enemy == null){
            this_unit.closest_enemy = unit_find_closest_enemy(this_unit)
            if(this_unit.closest_enemy == null){
                clearInterval(logic_loop)
                this_unit.turn_going = false
                return
            }
        }
        if (unit_check_if_enemy_next_space(this_unit) == true){
            this_unit.hits_this_turn ++
            this_unit.current_action = 'attack'
            unit_attack_enemy(this_unit)
            if (this_unit.hits_this_turn == game_settings.units.hits_per_turn){
                this_unit.closest_enemy = null
                this_unit.current_action = null
                this_unit.turn_going = false
                this_unit.hits_this_turn = 0
                return
            }
            return
        }
    }
    if (this_unit.current_action != 'attack'){
        if (this_unit.moves_this_turn < this_unit.spaces_per_move){
            this_unit.current_action = 'move'
            this_unit.moves_this_turn ++
            unit_move(this_unit)
        } else {
            if (this_unit.closest_enemy == null){
                this_unit.turn_going = false
            }
            this_unit.closest_enemy = unit_find_closest_enemy(this_unit)
            unit_get_new_target_pos(this_unit,0,0)
            this_unit.current_action = null
            this_unit.turn_going = false
            this_unit.moves_this_turn  = 0
            return
        }
    }
}

function unit_attack_enemy(this_unit){
    this_unit.closest_enemy.hit_points -= this_unit.attack_points
    unit_update_radius(this_unit.closest_enemy)
}

function unit_attack_obstacle(this_unit, obstacle){
    obstacle.hit_points -= this_unit.attack_points
    obstacle.update_width()
}

function unit_check_closest_enemy(this_unit, this_enemy, closest_enemies, shortest_long_side){
    
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
    var this_enemy_shortest_long_side = find_shortest_long_side(this_unit.current_pos, this_enemy.current_pos)
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
}

function unit_find_closest_enemy(this_unit){
    var closest_enemies = []
    closest_enemies.push(null)
    var shortest_long_side = 0
    for (var i = 0; i < players.length; i++){
        //Don't include units of the same colour
        if (players[i].colour != this_unit.colour && players[i].units.length > 0){
            for (var j = 0; j < players[i].units.length; j++){
                var results = unit_check_closest_enemy(this_unit, players[i].units[j], closest_enemies, shortest_long_side)
                closest_enemies = results[0]
                shortest_long_side = results[1]                    
            }
        }
    }
    var k = Math.floor(Math.random() * closest_enemies.length)
    return closest_enemies[k]
}