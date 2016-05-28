function get_query_string() {
    var url = window.location.href;
    var query = url.split('?')
    return query[1]
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