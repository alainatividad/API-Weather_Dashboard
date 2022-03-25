var cityEntryEl = document.querySelector('#city-entry');
var cityInputEl = document.querySelector('#city-name');
var currentWeatherEl = document.querySelector('.current-weather-div');
var forecastEl = document.querySelector('.forecast-div');
var searchEl = document.querySelector('.search-div');
var APIkey = "ec41c2204e5399dfc35aa2f07e953c27";

function getAPI(cityName) {
    // this is a two-part call to get the weather on the entered city:
    // the first one is getting the latitude and longitude of the city
    var apiGeoCoding = "https://api.openweathermap.org/geo/1.0/direct?q=" + cityName + "&limit=5&appid=" + APIkey;
    var i = 0;

    fetch(apiGeoCoding).then(function (response) {
        if (!response.ok) {
            throw response.json();
        }
        return response.json();
    })
        .then(function (locationData) {
            if (locationData.length > 0) {
                // GeoCoding API returns a max of 5 locations from the cityName provided so to get the index to use, compare the whole name of the output to the one entered
                while (i < locationData.length) {
                    if (locationData[i].name.toUpperCase() === cityName.toUpperCase()) {
                        break;
                    }
                    i++;
                }
                // get the city name in proper case
                cityName = locationData[i].name;
                // the second one is the actual call to get the current and forecast weather of the city
                // this is due to OneCall only accepting latitude and longitude values in its API call
                var apiWeatherUrl = "https://api.openweathermap.org/data/2.5/onecall?lat=" + locationData[i].lat + "&lon=" + locationData[i].lon + "&exclude=minutely,hourly,alerts&units=metric&appid=" + APIkey;
                getWeather(apiWeatherUrl, cityName);
            } else {
                alert('Invalid city');
                return;
            }
        });    
}

function getWeather(api, cityName) {    
    //moved function out of getAPI so that it can also be called when clicking the buttons
    fetch(api).then(function (response) {
        if (response.ok) {
            response.json().then(function (weatherData) {
                console.log(weatherData);
                // display current weather
                displayCurrentWeather(weatherData.current, cityName);
                // display 5-day forecast
                for (var i = 1; i < 6; i++){      
                    displayForecast(weatherData.daily[i],i);   
                }
                // create button for history
                createHistoryButton(cityName, api);
            })
        } else {
            alert("Can't find weather in " + cityName);
            return;
        }
    });
}

function displayCurrentWeather(resultObj, cityName) {
    if (!currentWeatherEl.hasChildNodes()) {
        //first time doing a search
        var resultCard = document.createElement('div');
        resultCard.classList.add('card', 'bg-light', 'text-dark', 'm-3', 'p-3', 'col-sm-11');   
    
        var resultBody = document.createElement('div');
        resultBody.classList.add('card-body','current-weather-body');
        resultCard.append(resultBody);
    
        var titleEl = document.createElement('h3');
        titleEl.innerHTML = '<strong>' + cityName +' (' + moment(resultObj.dt, "X").format("D MMM YYYY") + ') ' + '<i class="wi wi-owm-'+resultObj.weather[0].id+'"></i></strong>'
    
        var bodyContentEl = document.createElement('p');
        var uvIndex = checkUVI(resultObj.uvi);
        bodyContentEl.innerHTML = '<strong> Temp: </strong>' + resultObj.temp + '°C <br><strong> Humidity: </strong>' + resultObj.humidity + '% <br><strong> Wind <i class="wi wi-owm-957"></i>:</strong> ' + resultObj.wind_speed + ' m/s <br><strong> UV Index:</strong> ' + uvIndex    
        
        resultBody.append(titleEl, bodyContentEl);
        currentWeatherEl.append(resultCard);
    } else {
        //get the children and change the values in innerHTML
        var resultBody = document.querySelector('.current-weather-body');
        var titleEl = resultBody.children[0];
        titleEl.innerHTML = '<strong>' + cityName +' (' + moment(resultObj.dt, "X").format("D MMM YYYY") + ') ' + '<i class="wi wi-owm-'+resultObj.weather[0].id+'"></i></strong>'
    
        var bodyContentEl = resultBody.children[1];
        var uvIndex = checkUVI(resultObj.uvi);
        bodyContentEl.innerHTML = '<strong> Temp: </strong>' + resultObj.temp + '°C <br><strong> Humidity: </strong>' + resultObj.humidity + '% <br><strong> Wind <i class="wi wi-owm-957"></i>:</strong> ' + resultObj.wind_speed + ' m/s <br><strong> UV Index:</strong> ' + uvIndex
    }
}

function displayForecast(resultObj, iCount) {
    // checks whether the forecast element already contains the header and the 5-day forecast cards or not
    if (forecastEl.childElementCount < 6) {
        if (iCount === 1) {
            var forecastDiv = document.createElement('div');
            forecastDiv.classList.add('col-12');
    
            var forecastHeader = document.createElement('h3');
            forecastHeader.classList.add('display-4', 'mb-3');
            forecastHeader.textContent = '5-Day Forecast:'
            
            forecastDiv.append(forecastHeader);
            forecastEl.append(forecastDiv);
        }
    
        var resultCard = document.createElement('div');
        resultCard.classList.add('card', 'bg-light', 'text-dark', 'ml-3', 'mb-3', 'p-2', 'col-sm-11', 'col-md-5', 'col-lg-2', 'col-11');   
    
        var resultBody = document.createElement('div');
        resultBody.classList.add('card-body', 'p-lg-2', 'forecast'+iCount);
        resultCard.append(resultBody);
    
        var titleEl = document.createElement('h3');
        titleEl.classList.add('text-center');
        titleEl.innerHTML = '<strong>' + moment(resultObj.dt, "X").format("D MMM YYYY") + '</strong><br><i class="wi wi-owm-' + resultObj.weather[0].id + '"></i>';
    
        var bodyContentEl = document.createElement('p');
        bodyContentEl.innerHTML = '<strong> Temp: </strong>' + resultObj.temp.day + '°C <br><strong> Humidity: </strong>' + resultObj.humidity + '% <br><strong> Wind <i class="wi wi-owm-957"></i>:</strong> ' + resultObj.wind_speed + ' m/s';
            
        
        resultBody.append(titleEl, bodyContentEl);
        forecastEl.append(resultCard);
    } else {
        // just replace the innerHTML if it already has the cards
        var resultBody = document.querySelector('.forecast' + iCount);
        var titleEl = resultBody.children[0];
        titleEl.innerHTML = '<strong>' + moment(resultObj.dt, "X").format("D MMM YYYY") + '</strong><br><i class="wi wi-owm-' + resultObj.weather[0].id + '"></i>';
        
        var bodyContentEl = resultBody.children[1];
        bodyContentEl.innerHTML = '<strong> Temp: </strong>' + resultObj.temp.day + '°C <br><strong> Humidity: </strong>' + resultObj.humidity + '% <br><strong> Wind <i class="wi wi-owm-957"></i>:</strong> ' + resultObj.wind_speed + ' m/s';
    }
}

function checkUVI(uvI) {
    // creates a button with a background of either green, yellow, or red based on the UV Index
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

function createHistoryButton(cityName, api) {
    var cityArr = [];
    var newCity = {
        city: cityName,
        api: api
    };

    // get the string version of storedCity and check if the city is already on the string
    var city = localStorage.getItem("storedCity");
    var presentCity = false;
    if (city) {
        presentCity = city.includes(cityName);
    }

    // transform city to an object
    city = JSON.parse(localStorage.getItem("storedCity"));

    if (city) {
        for (var i = 0; i < city.length; i++) {
            cityArr.push(city[i]);
        }
    }

    //if not in localStorage or localStorage is empty
    if (!presentCity || !city) {
        var cityBtn = document.createElement('button');
        cityBtn.classList.add('btn', 'btn-primary', 'btn-block');
        cityBtn.setAttribute('data-api', api);
        cityBtn.textContent = cityName;
        searchEl.appendChild(cityBtn);
        cityArr.push(newCity);
    }

    localStorage.setItem("storedCity", JSON.stringify(cityArr));
}

function loadButtons() {
    var cityArr = JSON.parse(localStorage.getItem("storedCity"));
    var cityBtn = '';

    if (cityArr) {
        cityArr.forEach(function (element) {
            cityBtn = document.createElement('button');
            cityBtn.classList.add('btn', 'btn-primary', 'btn-block');
            cityBtn.setAttribute('data-api', element.api);
            cityBtn.textContent = element.city;
            searchEl.appendChild(cityBtn);
        });
    }

}

function searchBtnClickHandler(event) {
    var element = event.target;

    if (element.matches("button")) {
        var cityName = element.textContent;
        var cityApi = element.getAttribute('data-api');
        
        if (cityApi) {     
            getWeather(cityApi, cityName);   
        }
    }
}

function formSubmitHandler(event) {
    event.preventDefault();

    var cityName = cityInputEl.value;
    if (!cityName) {
        alert("Please enter a city.");
        return;
    }

    getAPI(cityName);
}

cityEntryEl.addEventListener('submit', formSubmitHandler);
searchEl.addEventListener('click', searchBtnClickHandler);
loadButtons();