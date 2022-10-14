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
        .then(response => response.json())
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
  constructor(name, href, color, id){
    this.name = name;
    this.href = href.includes("http") ? href : "http://" + href;
    this.color = color.split(" ").map(Number);
    this.id = id;

    const maxColor = Math.max(...[...new Set(this.color)]);
    this.textColor = maxColor < 200 ? "white" : "black";
    this.border = maxColor < 200 ? "none" : "solid rgb(220, 220, 220) 1px";
  }

  getManager(){
    const div = `<div class = "bottom-button bottom-button--strip manager-bookmark" style = "border: ${this.border}; background-color: rgb(${this.color[0]}, ${this.color[1]}, ${this.color[2]}); color: ${this.textColor};">`;
    const markName = `<span style = "font-size: inherit; overflow: hidden; text-overflow: ellipsis; width: 50vw">&nbsp${this.name}</span>`;
    const button = `<button style = "color: ${this.textColor};" class = "clear-button" onclick = "delBookmark(${this.id})">del&nbsp&nbsp</button>`;
    
    return div + markName + button + "</div>";
  }

  getMark(){
    return `<button class = "bottom-bookmark" style = "background-color: rgb(${this.color[0]}, ${this.color[1]}, ${this.color[2]}); color:${this.textColor};" onclick = "window.open('${this.href}', '_blank').focus()">${this.name}</button>`
  }

  set(name, href, color){
    this.name = name;
    this.href = href;
    this.color = color;
  }
}

function val(elm){return elm.value;}

var currID = 0;

function createMark(){
  const input = [Get("bookmark_name"), Get("bookmark_url"), Get("bookmark_color")];
  const vars = ["--c__name", "--c__url", "--c__color"];

  if(!input.map(val).includes('')){
    const newMark = new Bookmark(input[0].value, input[1].value, input[2].value, currID);
    bookmarks.push(newMark);
    Get("bookmark_manager").innerHTML = newMark.getManager() + Get("bookmark_manager").innerHTML;
    Get("bookmark_bar").innerHTML = newMark.getMark() + Get("bookmark_bar").innerHTML;
    currID += 1;
    
    for(const elm of input){elm.value = '';}

    for(let i = 0; i < 3; i++){
      input[i].style.setProperty(vars[i], "rgb(150, 150, 150)");
      input[i].style.borderColor = "rgb(150, 150, 150)";
    }

    return;
  }

  for(let i = 0; i < 3; i++){
    if(input[i].value == ''){
      input[i].style.setProperty(vars[i], "red");
      input[i].style.borderColor = "red";
    }
    else{
      input[i].style.borderColor = "rgb(150, 150, 150)";
      input[i].style.setProperty(vars[i], "#8e8e8e");
    }
  }
}

function delBookmark(id){


  for(var i = 0; i < bookmarks.length; i++){
    if(bookmarks[i].id == id){
      bookmarks.splice(i, 1);
      break;
    }
  }

  reconstructMarks();
  return;
}

function reconstructMarks(){
  var barHTML = '';
  var managerHTML = '';

  for(const mark of bookmarks){
    barHTML += mark.getMark();
    managerHTML += mark.getManager();
  }

  barHTML += `<button title = "open bookmark manager" class = "bottom-button bottom-button--square" id = "open_mark_manager" onclick = "showMarkManager()">&#43;</button>`;
  managerHTML += `<button title = "open bookmark creator" class = "bottom-button bottom-button--strip" id = "add_bookmark" onclick = "openMarkCreator()">+</button>`;

  Get("bookmark_bar").innerHTML = barHTML;
  Get("bookmark_manager").innerHTML = managerHTML;
}

function dictSearch(){
  Get("definitions").innerHTML = "loading...";

  fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${Get("dictionary_search").value}`)
    .then(response => response.json())
    .then(function(data){
      Get("definitions").innerHTML = "";

      const meanings = data[0].meanings;

      Get("definitions").innerHTML += data[0].word + "<br>";
      for(var i = 0; i < meanings.length; i++){
        Get("definitions").innerHTML += `<b style = "font-size: medium">${meanings[i].partOfSpeech}</b><ul class = "list-small" id = "${i}"></ul>`;

        for(def of meanings[i].definitions){
          Get(i.toString()).innerHTML += `<li>${def.definition}</li>`;
        }
      }

      Log(data);
    });
}

Get("dictionary_panel").style.display = "none";
function showDictionary(){
  const panel = Get("dictionary_panel");

  if(panel.style.display == "none"){
    panel.style.display = "block";
    return;
  }
  
  panel.style.display = "none";
}

Get("SearchInput").addEventListener("keydown", function (e) {
  if (e.code === "Enter") {
      Search();
  }
});

Get("dictionary_search").addEventListener("keydown", function (e) {
  if (e.code === "Enter") {
      dictSearch();
  }
});

UpdateWeather();
var Clock = setInterval(UpdateClock, 250);
UpdateDate();