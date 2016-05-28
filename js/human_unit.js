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
    this.radius = game_settings.units.radius_per_hp * this.hit_points
}