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
    var q = $('<td/>').addClass('query').text(result.q);
    return $('<tr/>')
        .append(user)
        .append(time)
        .append(lat)
        .append(lon)
        .append(text)
        .append(q);
}

function hasGeo(result) {
    return result.geo !== null &&
        result.geo.coordinates[0] !== 0 &&
        result.geo.coordinates[0] !== 0;
}

var map = $('#map').get(0);
var ctx = map.getContext('2d');
ctx.translate(map.width / 2, map.height / 2);
function draw(lat, lon) {
    ctx.fillStyle = 'red';
    ctx.globalAlpha = 0.75;
    ctx.beginPath();
    ctx.arc(lon * map.width / 360, lat * map.height / -180, 1, 0, 2 * Math.PI);
    ctx.fill();
}

var results = [], last = null;
$('form').submit(function(event) {
    event.preventDefault();
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
                    result.q = args.q;
                    results.push(result);
                    $('#output').append(makeRow(result));
                    draw(result.geo.coordinates[0], result.geo.coordinates[1]);
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
        row.push(quote(result.q));
        output.push(row.join(','));
    });
    return output.join('\n');
}

$('#save').bind('click', function(event) {
    event.preventDefault();
    var csv = toCSV(results);
    location = 'data:text/csv;base64,' + Base64.encode(csv);
});
