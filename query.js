var search = 'http://search.twitter.com/search.json';

function getProperty(prop) {
    return function(object) {
        return object[prop];
    };
}

var getGeo = getProperty('geo');

function status(message) {
    $('#status').text(message);
}

function makeRow(result) {
    var user = $('<td/>').addClass('user').text(result.from_user);
    var time = $('<td/>').addClass('time').text(result.created_at);
    var text = $('<td/>').addClass('tweet').text(result.text);
    var lat = $('<td/>').addClass('coord').text(result.geo.coordinates[0]);
    var lon = $('<td/>').addClass('coord').text(result.geo.coordinates[1]);
    return $('<tr/>')
        .append(user)
        .append(time)
        .append(lat)
        .append(lon)
        .append(text);
}

var results = [], last = null;
$('form').submit(function(event) {
    event.preventDefault();
    var $output = $('#output');
    var args = {
        q: $('#query').val(),
        rpp: 100,
        result_type: 'mixed'
    };

    function appender(response) {
        last = response;
        if (last.error) {
            status('Done.');
        } else {
            response.results.forEach(function(r) {
                if (r.geo) {
                    results.push(r);
                    $output.append(makeRow(r));
                }
            });
            if (response.page < 25) {
                args.page = (response.page + 1);
                status('Fetching page ' + args.page + ' ...');
                $.ajax({
                    url: search,
                    dataType: 'jsonp',
                    data: args,
                    success: appender
                });
            } else {
                status('Done fetching results.');
            }
        }
    }
    status('Fetching page 1 ...');
    $.ajax({
        url: search,
        dataType: 'jsonp',
        data: args,
        success: appender
    });
});
