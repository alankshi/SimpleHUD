var LastWeatherUpdate = 0;
var DisplayDate = 0;

function Get(id){
    return document.getElementById(id);
}

function UpdateClock(){
    var curr = new Date();
    var hours = curr.getHours().toString();
    var minutes = curr.getMinutes().toString();
    var seconds = curr.getSeconds().toString();

    if(seconds.length == 1){
        seconds = '0' + seconds;
    }

    if(minutes.length == 1){
        minutes = '0' + minutes;
    }

    Get("time").innerHTML = hours + ':' + minutes + ':' + seconds;
    setTimeout(UpdateClock, 500);
}

function UpdateDate(){
  DisplayDate = new Date().toLocaleDateString();
  Get("date").innerHTML = new Date().toLocaleDateString()
  setTimeout(UpdateDate, 10000);
}

function GeoSuccess(pos){
    coords = [pos.coords.latitude.toString(), pos.coords.longitude.toString()];
    //Get("weather").innerHTML = coords;

    fetch("https://api.weather.gov/points/" + coords[0] + ',' + coords[1], {method : "GET"})
        .then(function(response){
            return response.json();
        })
        .then(function(data){
            fetch(JSON.stringify(data.properties.forecast).replace('"', '').replace('"', ''))
                .then(function(response){
                    return response.json();
                })
                .then(function(data){
                    var Forecasts = JSON.parse(JSON.stringify(data.properties.periods));
                    var n = Forecasts[0]

                    var FullForecast = [n.name, n.shortForecast + " " + n.temperature + n.temperatureUnit];

                    Get("weather").innerHTML = FullForecast.join('<br>');
                });

        });
}

function UpdateWeather(){
    if('geolocation' in navigator){
        navigator.geolocation.getCurrentPosition(GeoSuccess);
    }
    else{
        Get("weather").innerHTML = "No Location Data";
    }
}

UpdateWeather();
UpdateClock();
UpdateDate();
