function unit_human_recentre(this_unit){
    var x_current = this_unit.current_pos[0] / this_unit.spaces_per_move
    var y_current = this_unit.current_pos[1] / this_unit.spaces_per_move
    var x_true = Math.round(x_current) * this_unit.spaces_per_move
    var y_true = Math.round(y_current) * this_unit.spaces_per_move
    this_unit.current_pos[0] = x_true
    this_unit.current_pos[1] = y_true
}

function unit_human_take_turn(this_unit){
    //Either remove, or heavily alter this function
    if (this_unit.player_order != null && this_unit.moves_this_turn == 0){
        unit_human_get_new_target_pos(this_unit)
        this_unit.player_order = null
    }
    this_unit.moves_this_turn ++
    if (this_unit.moves_this_turn < this_unit.spaces_per_move){
        unit_move(this_unit)
    } else {
        this_unit.current_action = null
        this_unit.turn_going = false
        this_unit.moves_this_turn = 0
        unit_human_recentre(this_unit)
    }
    return
}

function unit_human_get_new_target_pos(this_unit){
    //Keep, but alter heavily - the human player does not care which enemy is the closest. Maybe I can replace this entirely
    console.log('Order to move')
    function set_potential_target(current_pos, spaces_per_move, order_x, order_y){
        var init_x = current_pos[0] + (order_x * spaces_per_move)
        var init_y = current_pos[1] + (order_y * spaces_per_move)
        return [init_x, init_y]
    }
    var order_x = this_unit.player_order[0]
    var order_y = this_unit.player_order[1]
    var potential_target_pos = set_potential_target(this_unit.current_pos, this_unit.spaces_per_move, order_x, order_y)
    unit_update_target_pos_if_vacant(this_unit, potential_target_pos)
}