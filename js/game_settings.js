var game_settings = {
    canvas:{
        width: 0,
        height: 0,
        max_width: 600,
        max_height: 600
    },
    human_player:{
        display_x: 0, //In relation to the canvas
        display_y: 0,
    },
    units:{
        radius_per_hp: 0,
        spaces_per_move: 25, //Needs to be at least double the min_radius just to show up
        min_radius: 7, 
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
    between_loops: 5, //miliseconds
    turn: 0
}
game_settings.units.radius_per_hp = (game_settings.units.spaces_per_move - game_settings.units.min_radius * 2) / game_settings.units.hit_points * 0.5
game_settings.obstacles.width = game_settings.units.spaces_per_move
game_settings.obstacles.width_per_hp = (game_settings.obstacles.width - game_settings.obstacles.min_width) / game_settings.obstacles.hit_points * 3