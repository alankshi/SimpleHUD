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
    let hrs = curr.getHours();
    let mins = curr.getMinutes().toString().padStart(2, '0');
    let secs = curr.getSeconds().toString().padStart(2, '0');

    const CurrTime = curr.getTime();

    if(CurrTime - LastWeatherUpdate > 600000){
      UpdateWeather();
      LastWeatherUpdate = CurrTime;
    }

    if(hrs == 0 && mins == 0 && secs <= 1){
      UpdateDate();
    }

    if(hrs > 12){
      Get("M").innerHTML = "PM";
      hrs -= 12;
    }
    else{
      Get("M").innerHTML = "AM";
    }

    Get("ClockMainTime").innerHTML = `${hrs}:${mins}`;
    Get("ClockSecs").innerHTML = secs;
}

function UpdateDate(){
  DisplayDate = new Date().toLocaleDateString();
  Get("date").innerHTML = new Date().toLocaleDateString()
  setTimeout(UpdateDate, 10000);
}

function GeoSuccess(pos){
    coords = [pos.coords.latitude.toString(), pos.coords.longitude.toString()];
  
    fetch(`https://api.weather.gov/points/${coords[0]},${coords[1]}`, {method : "GET"})
        .then(function(response){
            return response.json();
        })
        .then(function(data){
            fetch(JSON.stringify(data.properties.forecast).replace('"', '').replace('"', ''))
                .then(function(response){
                    return response.json();
                })
                .then(function(data){
                  try{
                    var Forecasts = JSON.parse(JSON.stringify(data.properties.periods));  
                    const n = Forecasts[0]

                    const ShortForecast = [n.name, n.shortForecast + " " + n.temperature + n.temperatureUnit];

                    Get("WeatherIcon").innerHTML = `<img src = "${n.icon}"></img>`;
                    Get("weather").innerHTML = ShortForecast.join('<br>');
                    Get("DropdownMenu").innerHTML = n.detailedForecast;
                    Get("ShowWeather").innerHTML = `${n.temperature}&deg;F`;
                  }
                  catch(error){
                    Log("Could not get weather data from: ");
                    Log(`https://api.weather.gov/points/${coords[0]},${coords[1]}`);

                    Get("WeatherIcon").innerHTML = "";
                    Get("weather").innerHTML = "Could not get weather data";
                    Get("DropdownMenu").innerHTML = "Could not get weather data";
                    Get("ShowWeather").innerHTML = `NaN&deg;F`;

                    setTimeout(GeoSuccess, 30000);
                  }
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

Get("DropdownSlider").style.height = "0px";
function ShowWeatherDropdownMenu(){
    const menu = Get("DropdownMenu");
    const arrow = Get("DropdownArrow");
    const slider = Get("DropdownSlider");
    const Forecast = Get("Forecast");
    const fslider = Get('forecast_slider');

    if(slider.style.height == "0px"){
      fslider.style.height = `${Forecast.getBoundingClientRect().height + menu.getBoundingClientRect().height}px`;
      slider.style.height = `${menu.getBoundingClientRect().height}px`;
        arrow.style.transform = "rotate(-135deg)";
        arrow.style.bottom = "0vh";
    }
    else{
      fslider.style.height = `${Forecast.getBoundingClientRect().height - menu.getBoundingClientRect().height}px`;
      slider.style.height = "0px";
        arrow.style.transform = "rotate(45deg)";
        arrow.style.bottom = "1vh";
    }
}

function Search(){
  var term = Get("SearchInput").value;
  Get("SearchInput").value = '';
  term.replaceAll(" ", '+')
  window.open(`https://www.google.com/search?q=${term}`);
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

  Get("SWMainTime").innerHTML = "00:00:00";
  Get("SWMilli").innerHTML = "000";
}

var TimerActive = false;
var CurrTimer;
var TimerTime = 0;
var TimerStart;

function ToggleTimer(){
  TimerActive = !TimerActive;
  const e = Get("TimerControl");

  if(TimerActive){
    if(TimerTime <= 0){
      set_timer();
    }

    e.innerHTML = "Stop";
    CurrTimer = setInterval(RunTimer, 100);
    TimerStart = DObj().getTime();
    TimerActive = true;

    return;
  }

  TimerTime = TimerTime - (DObj().getTime() - TimerStart);
  TimerActive = false;
  e.innerHTML = "Start";
  clearInterval(CurrTimer);
}

function set_timer(){
  TimerTime = 1000 * (3600 * InputInt(Get("TimerHours").value) + 60 * InputInt(Get("TimerMins").value) + InputInt(Get("TimerSecs").value));

  if(TimerActive){
    TimerStart = DObj().getTime();
  }

  update_timer(TimerTime); 
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

  update_timer(t);
}

function update_timer(t){
  const [hrs, mins, secs, millisecs] = Mil2Time(t);

  Get("TimerMainTime").innerHTML = `${hrs}:${mins}`;
  Get("TimerSeconds").innerHTML = secs;
}

Get("forecast_slider").style.height = "0px"; 
Get("forecast_slider").style.border = "none";

function ShowWeather(){
  const Forecast = Get("Forecast");
  const Button = Get("ShowWeather");
  const slider = Get('forecast_slider');

  if(slider.style.height == "0px"){
    slider.style.border = "none";
    slider.style.height = `${Forecast.getBoundingClientRect().height}px`;
    Button.style.borderRadius = "0vw 0vw 0vw 0vw";
    Button.style.borderBottom = "none";
    Button.style.clipPath = "inset(-2vh -2vh 0vh -2vh)";
    Log("hidden box shadow");
  } 
  else{
    slider.style.height = "0px";
    Log("shown box shadow");
    setTimeout(closeWeather, 300);
  }
}

function closeWeather(){
  const button = Get("ShowWeather");
  const slider = Get('forecast_slider');
  
  button.style.borderRadius = "0vw 0vw 1vw 1vw";
  button.style.borderBottom = "none";
  slider.style.border = "none";
  button.style.clipPath = "inset(-2vh -2vh -2vh -2vh)";
  //button.style.clipPath = "none";
}

Get("bookmark_panels").style.display = "none";

function showMarkManager(){
  const panels = Get("bookmark_panels");

  if(panels.style.display == "none"){
    panels.style.display = "block";
  }
  else{
    panels.style.display = "none";
  }
}

var bookmarks = [];
Get("bookmark_creator").style.display = "none";

function openMarkCreator(){
  const creator = Get("bookmark_creator");

  if(creator.style.display == "none"){
    creator.style.display = "flex";
  }
  else{
    creator.style.display = "none";
  }
}

class Bookmark{
  constructor(name, href, color){
    this.name = name;
    this.href = href;
    this.color = color;
  }

  getManager(){
    //return html for mark inside bookmark manager
  }

  getMark(){
    //return html for mark in bottom bookmark bar
  }

  set(name, href, color){
    this.name = name;
    this.href = href;
    this.color = color;
  }
}

Get("SearchInput").addEventListener("keydown", function (e) {
    if (e.code === "Enter") {
        Search();
    }
});

UpdateWeather();
var Clock = setInterval(UpdateClock, 250);
UpdateDate();