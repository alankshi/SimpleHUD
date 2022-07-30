var LastWeatherUpdate = 0;
var DisplayDate = 0;

function Get(id){
    return document.getElementById(id);
}

function Log(text){
  console.log(text);
}

function DObj(){
  return new Date();
}

function UpdateClock(){
    const curr = DObj();
    let hours = curr.getHours().toString();
    let minutes = curr.getMinutes().toString().padStart(2, '0');
    let seconds = curr.getSeconds().toString().padStart(2, '0');

    if(parseInt(hours) % 12 != hours){
      Get("M").innerHTML = "PM";

      if(hours > 12){
        hours -= 12;
      }
    }
    else{
      Get("M").innerHTML = "AM";
    }

    Get("MainTime").innerHTML = hours + ':' + minutes;
    Get("seconds").innerHTML = seconds;
    setTimeout(UpdateClock, 500);
}

function UpdateDate(){
  DisplayDate = new Date().toLocaleDateString();
  Get("date").innerHTML = new Date().toLocaleDateString()
  setTimeout(UpdateDate, 10000);
}

function GeoSuccess(pos){
    coords = [pos.coords.latitude.toString(), pos.coords.longitude.toString()];

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
    if('geolocation' in navigator){
        navigator.geolocation.getCurrentPosition(GeoSuccess);
    }
    else{
        Get("weather").innerHTML = "No Location Data";
    }
}

function ShowWeatherDropdownMenu(){
    menu = Get("DropdownMenu");

    if(menu.style.display == "none"){
        menu.style.display = "block";
    }
    else{
        menu.style.display = "none";
    }
}

function Search(){
  var term = Get("SearchInput").value;
  Get("SearchInput").value = '';
  term.replaceAll(" ", '+')
  window.open("https://www.google.com/search?q=" + term);
}

function TimingSwitch(index){
  var TimingElements = [Get("stopwatch"), Get("timer"), Get("clock")];

  for(var i = 0; i < TimingElements.length; i++){
    if(i == index){
      TimingElements[i].style.display = "block";
    }
    else{
      TimingElements[i].style.display = "none";
    }
  }
}

var SWActive = false;
var SWStart;
var SWTimeP = 0;
var SWTime;
var CurrSW;

function ToggleSW(){
  SWActive = !SWActive;
  const e = Get("SWControl");

  if(SWActive){
    e.innerHTML = "Stop";

    SWStart = DObj().getTime();
    CurrSW = setInterval(SW, 1);
  }
  else{
    e.innerHTML = "Start";
    SWTimeP = SWTime;
    clearInterval(CurrSW);
  }
}

function SW(){
  const m = DObj().getTime();
  SWTime = m - SWStart + SWTimeP;

  let hours = Math.floor(SWTime / 3600000).toString().padStart(2, '0');
  let minutes = Math.floor((SWTime - (hours * 3600000)) / 60000).toString().padStart(2, '0');
  let seconds = Math.floor((SWTime - (hours * 3600000) - (minutes * 60000)) / 1000).toString().padStart(2, '0');
  let milliseconds = Math.floor(SWTime - (hours * 3600000) - (minutes * 60000) - (seconds * 1000)).toString().padStart(3, '0');

  Get("SWMainTime").innerHTML = hours + ":" + minutes + ":" + seconds; 
  Get("SWMilli").innerHTML = milliseconds;
}

function ResetSW(){
  SWTimeP = 0;
  SWTime = 0;
  SWStart = DObj().getTime();
}

Get("SearchInput").addEventListener("keydown", function (e) {
    if (e.code === "Enter") {
        Search();
    }
});

UpdateWeather();
UpdateClock();
UpdateDate();
