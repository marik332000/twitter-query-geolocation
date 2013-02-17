/*
 * https://dev.twitter.com/docs/api/1/get/search
 */

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

function hasGeo(result) {
    return result.geo !== null &&
        result.geo.coordinates[0] !== 0 &&
        result.geo.coordinates[0] !== 0;
}

var results = [], last = null;
$('form').submit(function(event) {
    event.preventDefault();
    var $output = $('#output');
    var args = {
        q: $('#query').val(),
        rpp: 100,
        result_type: $('#type').val()
    };

    function appender(response) {
        last = response;
        if (last.error) {
            status('Done.');
        } else {
            response.results.forEach(function(result) {
                if (hasGeo(result)) {
                    results.push(result);
                    $output.append(makeRow(result));
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

function quote(string) {
    return '"' + string.replace(/"/g, '""') + '"';
}

function toCSV(results) {
    var output = [];
    results.forEach(function(result) {
        var row = [];
        row.push(result.from_user);
        row.push(quote(result.created_at));
        row.push(result.geo.coordinates[0]);
        row.push(result.geo.coordinates[1]);
        row.push(quote(result.text));
        output.push(row.join(','));
    });
    return output.join('\n');
}

$('#save').bind('click', function(event) {
    event.preventDefault();
    var csv = toCSV(results);
    location = 'data:text/csv;base64,' + Base64.encode(csv);
});
