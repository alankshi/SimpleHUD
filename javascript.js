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

var LastWeatherUpdate = DObj().getTime();

function UpdateClock(){
    const curr = DObj();
    let hours = curr.getHours();
    let minutes = curr.getMinutes().toString().padStart(2, '0');
    let seconds = curr.getSeconds().toString().padStart(2, '0');

    const CurrTime = curr.getTime();

    if(CurrTime - LastWeatherUpdate > 600000){
      UpdateWeather();
      LastWeatherUpdate = CurrTime;
    }

    if(parseInt(hours) == 0 && minutes == 0 && seconds <= 1){
      UpdateDate();
    }

    if(hours % 12 != hours){
      Get("M").innerHTML = "PM";
      hours -= 12;
    }
    else{
      Get("M").innerHTML = "AM";
    }

    Get("MainTime").innerHTML = hours + ':' + minutes;
    Get("seconds").innerHTML = seconds;
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

var CurrentIndex = 2;
var TimingElements = [Get("stopwatch"), Get("timer"), Get("clock")];

function TimingSwitch(index){
  TimingElements[CurrentIndex].style.display = "none";
  TimingElements[index].style.display = "block";
  CurrentIndex = index;
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
    return;
  }

  e.innerHTML = "Start";
  SWTimeP = SWTime;
  clearInterval(CurrSW);
}

function Mil2Time(milli){
  let hours = Math.floor(milli / 3600000).toString().padStart(2, '0');
  let minutes = Math.floor((milli - (hours * 3600000)) / 60000).toString().padStart(2, '0');
  let seconds = Math.floor((milli - (hours * 3600000) - (minutes * 60000)) / 1000).toString().padStart(2, '0');
  let milliseconds = Math.floor(milli - (hours * 3600000) - (minutes * 60000) - (seconds * 1000)).toString().padStart(3, '0');

  return [hours, minutes, seconds, milliseconds];
}

function SW(){
  const m = DObj().getTime();
  SWTime = m - SWStart + SWTimeP;
  const [hours, minutes, seconds, milliseconds] = Mil2Time(SWTime);

  Get("SWMainTime").innerHTML = `${hours}:${minutes}:${seconds}`; 
  Get("SWMilli").innerHTML = milliseconds;
}

function ResetSW(){
  SWTimeP = 0;
  SWTime = 0;
  SWStart = DObj().getTime();
}

var TimerActive = false;
var CurrTimer;
var TimerTime;
var TimerStart;

function ToggleTimer(){
  TimerActive = !TimerActive;
  const e = Get("TimerControl");

  if(TimerActive){
    e.innerHTML = "Stop";
    CurrTimer = setInterval(RunTimer, 100);
    TimerStart = DObj().getTime();
    TimerTime = 1000 * (3600 * InputInt(Get("TimerHours").value) + 60 * InputInt(Get("TimerMins").value) + InputInt(Get("TimerSecs").value));
    return;
  }
  
  e.innerHTML = "Start";
  clearInterval(CurrTimer);
}

function InputInt(input){
  if(!input){
    return 0;
  }
  else{
    return parseInt(input);
  }
}

function RunTimer(){
  const t = TimerTime - (DObj().getTime() - TimerStart);

  if(t <= 0){
    Get("TimerSeconds").innerHTML = "00";
    ToggleTimer();
    return;
  }

  const [hrs, mins, secs, millisecs] = Mil2Time(t);

  Get("TimerMainTime").innerHTML = `${hrs}:${mins}`;
  Get("TimerSeconds").innerHTML = secs;
}

Get("SearchInput").addEventListener("keydown", function (e) {
    if (e.code === "Enter") {
        Search();
    }
});

UpdateWeather();
var Clock = setInterval(UpdateClock, 250);
UpdateDate();