//Spawns enemies and you
//TO DO Create an object for each player, and give it an array of units (also objects). Add all player objects to an array of players

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