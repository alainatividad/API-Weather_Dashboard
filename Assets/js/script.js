var cityEntryEl = document.querySelector('#city-entry');
var cityInputEl = document.querySelector('#city-name');
var currentWeatherEl = document.querySelector('.current-weather');
var forecastEl = document.querySelector('.forecast');
var APIkey = "ec41c2204e5399dfc35aa2f07e953c27";

function formSubmitHandler(event) {
    event.preventDefault();

    var cityName = cityInputEl.value;
    if (!cityName) {
        alert("Please enter a city.");
        return;
    }

    getAPI(cityName);

}

function getAPI(cityName) {
    var apiGeoCoding = "https://api.openweathermap.org/geo/1.0/direct?q=" + cityName + "&limit=1&appid=" + APIkey;
    var apiWeatherUrl = '';

    fetch(apiGeoCoding).then(function (response) {
        if (response.ok) {
            response.json().then(function (data) {
                apiWeatherUrl = "https://api.openweathermap.org/data/2.5/onecall?lat=" + data[0].lat + "&lon=" + data[0].lon + "&exclude=minutely,hourly,alerts&units=metric&appid=" + APIkey;
                cityName = data[0].name;
                fetch(apiWeatherUrl).then(function (response) {
                    if (response.ok) {
                        response.json().then(function (data) {
                            displayWeather(data.current, cityName);
                            for (var i = 1; i < 6; i++){                         
                                displayForecast(data.daily[i],i);   
                            }
                            localStorage.setItem("city", cityName);
                        })
                    }
                });
            })
        }
    });

    
}

function displayWeather(resultObj, cityName) {
    var resultCard = document.createElement('div');
    resultCard.classList.add('card', 'bg-light', 'text-dark', 'm-3', 'p-3');   

    var resultBody = document.createElement('div');
    resultBody.classList.add('card-body');
    resultCard.append(resultBody);

    var titleEl = document.createElement('h3');
    titleEl.innerHTML = '<strong>' + cityName +' (' + moment(resultObj.dt, "X").format("D MMM YYYY") + ') ' + '<i class="wi wi-owm-'+resultObj.weather[0].id+'"></i></strong>'

    var bodyContentEl = document.createElement('p');
    var uvIndex = checkUVI(resultObj.uvi);
    bodyContentEl.innerHTML = '<strong> Temp: </strong>' + resultObj.temp + ' °C <br><strong> Humidity: </strong>' + resultObj.humidity + '% <br><strong> Wind <i class="wi wi-owm-957"></i>:</strong> ' + resultObj.wind_speed + ' m/s <br><strong> UV Index:</strong> ' + uvIndex
        
    
    resultBody.append(titleEl, bodyContentEl);
    currentWeatherEl.append(resultCard);
}

function displayForecast(resultObj, iCount) {
    if (iCount === 1) {
        var forecastDiv = document.createElement('div');
        forecastDiv.classList.add('col-12');

        var forecastHeader = document.createElement('h3');
        forecastHeader.classList.add('display-4');
        forecastHeader.textContent = '5-Day Forecast:'
        
        forecastDiv.append(forecastHeader);
        forecastEl.append(forecastDiv);
    }

    var resultCard = document.createElement('div');
    resultCard.classList.add('card', 'bg-light', 'text-dark', 'm-3', 'p-3');   

    var resultBody = document.createElement('div');
    resultBody.classList.add('card-body');
    resultCard.append(resultBody);

    var titleEl = document.createElement('h3');
    titleEl.innerHTML = '<strong>' + moment(resultObj.dt, "X").format("D MMM YYYY") + '</strong><br><i class="wi wi-owm-'+resultObj.weather[0].id+'"></i>'

    var bodyContentEl = document.createElement('p');
    bodyContentEl.innerHTML = '<strong> Temp: </strong>' + resultObj.temp + ' °C <br><strong> Humidity: </strong>' + resultObj.humidity + '% <br><strong> Wind <i class="wi wi-owm-957"></i>:</strong> ' + resultObj.wind_speed + ' m/s'
        
    
    resultBody.append(titleEl, bodyContentEl);
    forecastEl.append(resultCard);
}

function checkUVI(uvI) {
    var uvIndex = '';

    if (uvI < 3) {
        uvIndex = '<button type="button" class="btn disabled btn-success btn-sm">'+uvI+'</button>'
    } else if (uvI < 6) {
        uvIndex = '<button type="button" class="btn disabled btn-warning btn-sm">'+uvI+'</button>'
    } else {
        uvIndex = '<button type="button" class="btn disabled btn-danger btn-sm">'+uvI+'</button>'
    }
    return uvIndex;
}
cityEntryEl.addEventListener('submit', formSubmitHandler);