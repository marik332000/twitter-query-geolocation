var search = 'http://search.twitter.com/search.json';

function getProperty(prop) {
    return function(object) {
        return object[prop];
    };
}

var getGeo = getProperty('geo');

var results = [];
$('form').submit(function(event) {
    event.preventDefault();
    var $output = $('#output');
    var args = {
        q: $('#query').val(),
        rpp: 100,
        result_type: 'mixed'
    };
    $.ajax({
        url: search,
        dataType: 'jsonp',
        data: args,
        success: function(response) {
            var count = 0;
            response.results.forEach(function(r) {
                if (r.geo) {
                    count++;
                    results.push(r);
                    var user = $('<td/>').addClass('user').text(r.from_user);
                    var time = $('<td/>').addClass('time').text(r.created_at);
                    var text = $('<td/>').addClass('tweet').text(r.text);
                    var lat = $('<td/>').addClass('coord')
                            .text(r.geo.coordinates[0]);
                    var lon = $('<td/>').addClass('coord')
                            .text(r.geo.coordinates[1]);
                    var row = $('<tr/>')
                            .append(user)
                            .append(time)
                            .append(lat)
                            .append(lon)
                            .append(text);
                    $output.append(row);
                }
            });
            console.log('found ' + count);
        }
    });
});
