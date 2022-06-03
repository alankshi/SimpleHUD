var LastWeatherUpdate = 0;
var DisplayDate = 0;

//Shorthand functions
function Get(id){
    return document.getElementById(id);
}

function Log(text){
  console.log(text);
}

function UpdateClock(){
    var curr = new Date();
    var hours = curr.getHours().toString();
    var minutes = curr.getMinutes().toString();
    var seconds = curr.getSeconds().toString();

    //AM and PM support
    if(parseInt(hours) % 12 != hours){
      Get("M").innerHTML = "PM";

      if(hours > 12){
        hours -= 12;
      }
    }
    else{
      Get("M").innerHTML = "AM";
    }

    //Adding leading zeros to minutes and seconds
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

    //Access API to get forecast based on longitude and latitude
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

                    var ShortForecast = [n.name, n.shortForecast + " " + n.temperature + n.temperatureUnit];

                    Get("WeatherIcon").innerHTML = '<img src = "' + n.icon + '"></img>';
                    Get("weather").innerHTML = ShortForecast.join('<br>');
                    Get("DropdownMenu").innerHTML = n.detailedForecast;
                });

        });
}

function UpdateWeather(){
    //Check if geolocation is supported
    if('geolocation' in navigator){
        navigator.geolocation.getCurrentPosition(GeoSuccess);
    }
    else{
        Get("weather").innerHTML = "No Location Data";
    }
}

function ShowWeatherDropdownMenu(){
    menu = Get("DropdownMenu");

    if(menu.style.visibility == "hidden"){
        menu.style.visibility = "visible";
    }
    else{
        menu.style.visibility = "hidden";
    }
}

Get("DropdownMenu").style.visibility = "hidden";

UpdateWeather();
UpdateClock();
UpdateDate();
