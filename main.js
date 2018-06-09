"use strict";

// Config
var cfg = {
    apikey: "******************",
    city:"Samara",
    outside: {
        temp: true,
        tname: "ds_temp",
        hum: false,
        hname: "",
    },
    inside: {
        temp: true,
        tname: "dht1_temp",
        hum: true,
        hname: "dht1_hum",
    }
}


// Vars
var weather = new Framework7();
var $ = Dom7;

// Outside temp block
if ( cfg.outside.temp ) {
    $('#w__street_temp').show();
    var ot = document.querySelector('#w__street_temp .epie');
    var otpc = new EasyPieChart(ot, {
        barColor: function ( data ) {
            return ( data >= 0 ? '#ff3b30' : '#007aff' );
        },
        trackColor: "#b6b6b6",
        scaleColor: "#b6b6b6",
        size: 120,
        lineWidth: 4,
        onStep: function( from, to, cur) {
            $("#w__street_temp span").html( parseInt(cur*3.5)/10 + "&deg;" );
        }
    });
}

// Outside hum block
if ( cfg.outside.hum ) {
    $('#w__street_hum').show();
    var oh = document.querySelector('#w__street_hum .epie');
    var ohpc = new EasyPieChart(oh, {
        barColor: function ( data ) {
            return ( data >= 50 ? '#ffcc00' : '#4cd964' );
        },
        trackColor: "#b6b6b6",
        scaleColor: "#b6b6b6",
        size: 120,
        lineWidth: 4,
        onStep: function( from, to, cur) {
            $("#w__street_hum span").html( parseInt(cur) + "%" );
        }
    });
}

// Inside temp block
if ( cfg.inside.temp ) {
    $('#w__home_temp').show();
    var it = document.querySelector('#w__home_temp .epie');
    var itpc = new EasyPieChart(it, {
        barColor: function ( data ) {
            return ( data >= 0 ? '#ff3b30' : '#007aff' );
        },
        trackColor: "#b6b6b6",
        scaleColor: "#b6b6b6",
        size: 120,
        lineWidth: 4,
        onStep: function( from, to, cur) {
            $("#w__home_temp span").html( parseInt(cur*3.5)/10 + "&deg;" );
        }
    });
}

// Inside hum block
if ( cfg.inside.hum ) {
    $('#w__home_hum').show();
    var ih = document.querySelector('#w__home_hum .epie');
    var ihpc = new EasyPieChart(ih, {
        barColor: function ( data ) {
            return ( data >= 50 ? '#ffcc00' : '#4cd964' );
        },
        trackColor: "#b6b6b6",
        scaleColor: "#b6b6b6",
        size: 120,
        lineWidth: 4,
        onStep: function( from, to, cur) {
            $("#w__home_hum span").html( parseInt(cur) + "%" );
        }
    });
}

// Load sensors data from ESP
function reloadSensorsData() {
        $.getJSON("http://weather.luway.ru:8888/sensors.json", function(data){
        if ( data.success ) {
            if (cfg.outside.temp) otpc.update(data.list[cfg.outside.tname]/0.35);
            if (cfg.outside.hum) ohpc.update(data.list[cfg.outside.hname]);
            if (cfg.inside.temp) itpc.update(data.list[cfg.inside.tname]/0.35);
            if (cfg.inside.hum) ihpc.update(data.list[cfg.inside.hname]);
        } else {
            if (cfg.outside.temp) otpc.update(0);
            if (cfg.outside.hum) ohpc.update(0);
            if (cfg.inside.temp) itpc.update(0);
            if (cfg.inside.hum) ihpc.update(0);
        }
    });

}

// Current weather from openweather
function getCurrentWeather(){

    var curw = $("#w__current");
    var url = "http://api.openweathermap.org/data/2.5/find?q="+cfg.city+"&units=metric&lang=ru&appid="+cfg.apikey;

    $.getJSON( url, function(data){

        // Icon
        var wicon = data.list[0].weather[0].id;
        var wicond = data.list[0].weather[0].description;
        curw.find(".weather_icon").html('<a title="'+wicond+'"><i class="wi wi-owm-'+wicon+'"></i></a>');

        // Wind icon
        var winddeg = data.list[0].wind.deg;
        var wwind = parseInt( ( winddeg < 180 ) ? winddeg + 180 : winddeg - 180 );
        curw.find(".weather_wind").html('<i class="wi wi-wind towards-'+wwind+'-deg"></i>');

        // Wind speed
        var wwinds = data.list[0].wind.speed;
        curw.find(".weather_ws").html(wwinds+' м/с');

        // Temp
        var wtemp = Math.round(data.list[0].main.temp*10)/10;
        curw.find(".weather_temp").html(wtemp+'&deg;');

        // Pressure
        var wpres = parseInt(data.list[0].main.pressure/1.33322);
        curw.find(".weather_pres").html(wpres);

        // Humidity
        var whum = data.list[0].main.humidity;
        curw.find(".weather_hum").html(whum+' %');

    });

}

// Forecast weather from openweather
function getForecastWeather(){

    var fcw = $("#w__forecast");
    var url = "http://api.openweathermap.org/data/2.5/forecast?q="+cfg.city+"&units=metric&lang=ru&cnt=6&appid="+cfg.apikey;

    fcw.find(".weather_block").each(function(){
        if ( !$(this).hasClass('template') ) $(this).remove();
    });

    $.getJSON(url, function(data){

        console.log(data);

        $.each(data.list, function(index, value){
            if ( index % 2 != 0 ) return true;
            var dateObj = new Date(value.dt*1000);
            var date_val = DateFormat.format.date(value.dt*1000, "H:mm, d MMM yyyy");
            var el = document.querySelector('#w__forecast .template').cloneNode(true);
            console.log("Ok!");
            el.classList.remove('template');
            el.setAttribute('date', date_val);
            fcw.find(".card-content").append(el);
            console.log("Ok!");

            // Icon
            var wicon = value.weather[0].id;
            var wicond = value.weather[0].description;
            fcw.find(".weather_block[date='"+date_val+"'] .weather_icon").html('<a title="'+wicond+'"><i class="wi wi-owm-'+wicon+'"></i></a>');

            // Wind icon
            var winddeg = value.wind.deg;
            var wwind = parseInt( ( winddeg < 180 ) ? winddeg + 180 : winddeg - 180 );
            fcw.find(".weather_block[date='"+date_val+"'] .weather_wind").html('<i class="wi wi-wind towards-'+wwind+'-deg"></i>');

            // Wind speed
            var wwinds = value.wind.speed;
            fcw.find(".weather_block[date='"+date_val+"'] .weather_ws").html(wwinds+' м/с');

            // Temp
            var wtemp = Math.round(value.main.temp*10)/10;
            fcw.find(".weather_block[date='"+date_val+"'] .weather_temp").html(wtemp+'&deg;');

            // Pressure
            var wpres = parseInt(value.main.pressure/1.33322);
            fcw.find(".weather_block[date='"+date_val+"'] .weather_pres").html(wpres);

            // Humidity
            var whum = value.main.humidity;
            fcw.find(".weather_block[date='"+date_val+"'] .weather_hum").html(whum+' %');

        });
    });

}

// Run on load
reloadSensorsData();
getCurrentWeather();
setTimeout(function(){
    getForecastWeather();
},500);

// Update data on refresh
var ptrContent = $('.home-refresh');
ptrContent.on('refresh', function (e) {
    setTimeout(function() {

        // Update temps
        reloadSensorsData();
        getCurrentWeather();
        setTimeout(function(){
            getForecastWeather();
        },500);

        weather.pullToRefreshDone();
    }, 2000);
});

// Auto reload pie data every 10 sec
setInterval(
    function(){
        reloadSensorsData();
    },
    10*1000
);

// Auto reload weather every hour
setInterval(
    function(){
        getCurrentWeather();
        setTimeout(function(){
            getForecastWeather();
        },500);
    },
    60*60*1000
);
