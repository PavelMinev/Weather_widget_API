window.onload = function() {
	(function init() {
		function escapeHtml(text) { // заменяет все html-теги в строке на кодовые значения
			var map = {
				'&': '&amp;',
				'<': '&lt;',
				'>': '&gt;',
				'"': '&quot;',
				"'": '&#039;'
			};
			return text.replace(/[&<>"']/g, function(m) { return map[m]; });
		}
		//key = http://api.openweathermap.org/data/2.5/forecast?id=524901&APPID=a4f2eeab71098e8006553f5df1d6f957
		var inputCity = document.getElementsByClassName("search-city__input")[0];
		var search = document.getElementsByClassName("search")[0];
		var error = document.getElementsByClassName("error")[0];
		var cityBlock = document.getElementsByClassName("widget-temperature__p")[0];
		var temperatureBlock = document.getElementsByClassName("widget-temperature__span")[0];
		var weekBlock = document.getElementsByClassName("week-weather__item");
		var dayBlock = document.getElementsByClassName("widget-date__span")[0];
		var dateBlock = document.getElementsByClassName("widget-date__p")[0];
		var windBlock = document.getElementsByClassName("widget-wind__p")[0];
		var next = document.getElementsByClassName("week-weather__button--next")[0];
		var prev = document.getElementsByClassName("week-weather__button--prev")[0];

		var pos = -1;
		var regCity = /^[А-ЯA-Z][а-яa-z]+(?:[- `][A-ZА-Я][a-zа-я]*)*(?:[- `][0-9]+)*$/;

		var date = new Date();
		var month = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
		var	day = ["Sunday", "Monday", "Tuesday", "Wednesday","Thursday", "Friday", "Saturday"];
		var weekDay = date.getDate();
		var weekDayStr = "";
		var dayStr = "";

		month = month[date.getMonth()];
		dayStr = day[date.getDay()];
		if (weekDay % 10 === 1) weekDayStr = weekDay.toString() + "st";
		else if (weekDay % 10 === 2) weekDayStr = weekDay.toString() + "nd";
		else if (weekDay % 10 === 3) weekDayStr = weekDay.toString() + "rd";
		else weekDayStr = weekDay.toString() + "th";
		dayBlock.innerHTML = dayStr;
		dateBlock.innerHTML = month + ", " + weekDayStr;

		inputCity.onclick = function() {
			error.style.width = 0;
		};

		inputCity.onkeyup = function(e){
			var city = escapeHtml(inputCity.value);
			var regFirst = /[A-ZА-Я]/;
			var cityLength = city.length;
			if (e.code === "Enter") {
				if (regCity.exec(city)) {
					error.style.width = 0;
					getWeather(city);
				}else if (city === " ") {
					error.style.width = "100%";
				}else {
					error.firstChild.innerHTML = "Wrong city name";
					error.style.width = "100%";
				};
			}else{
				if (cityLength === 1) {
					city = city.toLocaleUpperCase();
					if (regFirst.exec(city)){
						inputCity.value = city;
					}else {
						error.firstChild.innerHTML = "First symbol chould be the letter";
						error.style.width = "100%";
					};
				}else if (city == "") {
					error.style.width = 0;
				}else {
					if (city[cityLength - 2] === "-" || city[cityLength - 2] === " ") {
						var letter = city[cityLength - 1];
						letter = letter.toLocaleUpperCase();
						city = city.replace(city[cityLength - 1], letter);
						inputCity.value = city;
					};
				};
			};
		};

		search.onclick = function() {
			var city = escapeHtml(inputCity.value);
			var OK = regCity.exec(city);
			if (OK) {
				error.style.width = 0;
				getWeather(city);
			} else {
				error.style.width = "100%";
			};
		};

		function getWeather(city) {
			var space = -1;
			var cityRequest = city;
			while (city.indexOf(" ",space+1) !== -1) {
				cityRequest = city.replace(city[space+=1], "%20");
			};
			var xhr = new XMLHttpRequest();
			xhr.open('GET','http://api.openweathermap.org/data/2.5/forecast?q=' + cityRequest + '&units=metric&APPID=a4f2eeab71098e8006553f5df1d6f957&cnt=14',true);
			xhr.send();
			xhr.onreadystatechange = function() {
				if (xhr.readyState != 4) return;
				error.firstChild.innerHTML = 'Ready!';
				error.style.width = "100%";
				setTimeout(function(){
					error.style.width = 0;
				},3000);			

				if (xhr.status != 200) {
					error.firstChild.innerHTML = "Error! Plese, try again later.";
					error.style.width = "100%";
				} else {
					// If everything is OK
					var obj = JSON.parse(xhr.responseText);
					var speed = obj.list[0].wind.speed * 2.24;
					var mainTemp = obj.list[0].main.temp;
					speed = speed.toString();
					speed = speed.substr(0, speed.indexOf(".") + 2);
					mainTemp = mainTemp.toString();
					mainTemp = (mainTemp.indexOf(".") !== -1) ? mainTemp.substr(0,mainTemp.indexOf(".")) : mainTemp;
					if (mainTemp === "-0") mainTemp = "0";
					cityBlock.innerHTML = obj.city.name + ", " + obj.city.country;
					temperatureBlock.innerHTML = mainTemp + " °";
					windBlock.innerHTML = speed + "<span class=\"widget-wind__span\">mph</span>";
					for (var i = 0; i < weekBlock.length; i++) {
						var time = date.getTime() + (i + 1) * 1000 * 60 * 60 * 24;
						var weekDayStr = new Date(time);			
						var weekTemp = obj.list[i+1].main.temp;
						weekTemp = weekTemp.toString();
						weekTemp = (weekTemp.indexOf(".") !== -1) ? weekTemp.substr(0,weekTemp.indexOf(".")) : weekTemp;
						if (weekTemp === "-0") weekTemp = "0";
						weekBlock[i].firstElementChild.innerHTML = day[weekDayStr.getDay()];
						weekBlock[i].children[2].innerHTML = weekTemp + " °";
						weekBlock[i].children[1].innerHTML = '<img class="widget-wind__img" src="img/' + obj.list[(i + 1)].weather[0].icon + '.png" alt="' + obj.list[(i + 1)].weather[0].description + '">';
						setInterval(function(){getWeather(city)}, 1000*60*10);
					};
				};
			};
			error.firstChild.innerHTML = 'Loading...';
			error.style.width = "100%";
		};

		var marginWeek = 0;
		weekBlock[0].style.marginLeft = "0%";

		function marginStep() {
			return (window.innerWidth > 600) ? 25 : 100 / 3;
		};

		next.onclick = function() {
			if (marginWeek < 9) {
				marginWeek = marginWeek + 1;
				weekBlock[0].style.marginLeft = "-" + (marginWeek * marginStep()) + "%";
			};
		};

		prev.onclick = function() {
			if (marginWeek > 0) {
				marginWeek = marginWeek - 1;
				weekBlock[0].style.marginLeft = "-" + (marginWeek * marginStep()) + "%";
			};
		};
	})();
	

};

// obj={
// 	"cod":"200",
// 	"message":0.0027,
// 	"cnt":14,
// 	"list":[
// 	{
// 		"dt":1509310800,
// 		"main":{"temp":6.1,"temp_min":6.1,"temp_max":7.41,"pressure":1032.72,"sea_level":1040.37,"grnd_level":1032.72,"humidity":77,"temp_kf":-1.31},
// 		"weather":[{"id":800,"main":"Clear","description":"clear sky","icon":"02n"}],
// 		"clouds":{"all":8},
// 		"wind":{"speed":3.57,"deg":352.501},
// 		"rain":{},
// 		"sys":{"pod":"n"},
// 		"dt_txt":"2017-10-29 21:00:00"
// 	},{
// 		"dt":1509321600,
// 		"main":{"temp":5.26,"temp_min":5.26,"temp_max":6.13,"pressure":1033.29,"sea_level":1041.05,"grnd_level":1033.29,"humidity":82,"temp_kf":-0.87},
// 		"weather":[{"id":800,"main":"Clear","description":"clear sky","icon":"01n"}],
// 		"clouds":{"all":0},
// 		"wind":{"speed":3.81,"deg":346.501},
// 		"rain":{},
// 		"sys":{"pod":"n"},
// 		"dt_txt":"2017-10-30 00:00:00"
// 	},{
// 		"dt":1509332400,
// 		"main":{"temp":4.74,"temp_min":4.74,"temp_max":5.18,"pressure":1034.04,"sea_level":1041.91,"grnd_level":1034.04,"humidity":90,"temp_kf":-0.44},
// 		"weather":[{"id":500,"main":"Rain","description":"light rain","icon":"10n"}],
// 		"clouds":{"all":0},
// 		"wind":{"speed":3.76,"deg":346.503},
// 		"rain":{"3h":0.0025},
// 		"sys":{"pod":"n"},
// 		"dt_txt":"2017-10-30 03:00:00"
// 	},{
// 		"dt":1509343200,
// 		"main":{"temp":4.4,"temp_min":4.4,"temp_max":4.4,"pressure":1034.87,"sea_level":1042.78,"grnd_level":1034.87,"humidity":95,"temp_kf":0},"weather":[{"id":800,"main":"Clear","description":"clear sky","icon":"01n"}],"clouds":{"all":0},"wind":{"speed":3.4,"deg":349.501},"rain":{},"sys":{"pod":"n"},"dt_txt":"2017-10-30 06:00:00"},{"dt":1509354000,"main":{"temp":6.6,"temp_min":6.6,"temp_max":6.6,"pressure":1036.03,"sea_level":1043.89,"grnd_level":1036.03,"humidity":81,"temp_kf":0},"weather":[{"id":800,"main":"Clear","description":"clear sky","icon":"01d"}],"clouds":{"all":0},"wind":{"speed":3.11,"deg":347.5},"rain":{},"sys":{"pod":"d"},"dt_txt":"2017-10-30 09:00:00"},{"dt":1509364800,"main":{"temp":10.53,"temp_min":10.53,"temp_max":10.53,"pressure":1036.38,"sea_level":1044.1,"grnd_level":1036.38,"humidity":79,"temp_kf":0},"weather":[{"id":800,"main":"Clear","description":"clear sky","icon":"02d"}],"clouds":{"all":8},"wind":{"speed":2.71,"deg":350.001},"rain":{},"sys":{"pod":"d"},"dt_txt":"2017-10-30 12:00:00"},{"dt":1509375600,"main":{"temp":10.62,"temp_min":10.62,"temp_max":10.62,"pressure":1035.88,"sea_level":1043.6,"grnd_level":1035.88,"humidity":73,"temp_kf":0},"weather":[{"id":802,"main":"Clouds","description":"scattered clouds","icon":"03d"}],"clouds":{"all":36},"wind":{"speed":2.32,"deg":343.001},"rain":{},"sys":{"pod":"d"},"dt_txt":"2017-10-30 15:00:00"},{"dt":1509386400,"main":{"temp":7,"temp_min":7,"temp_max":7,"pressure":1036.61,"sea_level":1044.44,"grnd_level":1036.61,"humidity":81,"temp_kf":0},"weather":[{"id":802,"main":"Clouds","description":"scattered clouds","icon":"03n"}],"clouds":{"all":36},"wind":{"speed":2.06,"deg":322.503},"rain":{},"sys":{"pod":"n"},"dt_txt":"2017-10-30 18:00:00"},{"dt":1509397200,"main":{"temp":3.42,"temp_min":3.42,"temp_max":3.42,"pressure":1036.56,"sea_level":1044.53,"grnd_level":1036.56,"humidity":95,"temp_kf":0},"weather":[{"id":800,"main":"Clear","description":"clear sky","icon":"01n"}],"clouds":{"all":0},"wind":{"speed":1.16,"deg":265.002},"rain":{},"sys":{"pod":"n"},"dt_txt":"2017-10-30 21:00:00"},{"dt":1509408000,"main":{"temp":1.7,"temp_min":1.7,"temp_max":1.7,"pressure":1036.33,"sea_level":1044.3,"grnd_level":1036.33,"humidity":93,"temp_kf":0},"weather":[{"id":800,"main":"Clear","description":"clear sky","icon":"01n"}],"clouds":{"all":0},"wind":{"speed":1.17,"deg":233.002},"rain":{},"sys":{"pod":"n"},"dt_txt":"2017-10-31 00:00:00"},{"dt":1509418800,"main":{"temp":1.08,"temp_min":1.08,"temp_max":1.08,"pressure":1035.38,"sea_level":1043.45,"grnd_level":1035.38,"humidity":93,"temp_kf":0},"weather":[{"id":800,"main":"Clear","description":"clear sky","icon":"01n"}],"clouds":{"all":0},"wind":{"speed":1.3,"deg":220.001},"rain":{},"sys":{"pod":"n"},"dt_txt":"2017-10-31 03:00:00"},{"dt":1509429600,"main":{"temp":2.42,"temp_min":2.42,"temp_max":2.42,"pressure":1034.61,"sea_level":1042.55,"grnd_level":1034.61,"humidity":89,"temp_kf":0},"weather":[{"id":803,"main":"Clouds","description":"broken clouds","icon":"04n"}],"clouds":{"all":56},"wind":{"speed":2.58,"deg":218.501},"rain":{},"sys":{"pod":"n"},"dt_txt":"2017-10-31 06:00:00"},{"dt":1509440400,"main":{"temp":6.7,"temp_min":6.7,"temp_max":6.7,"pressure":1034.43,"sea_level":1042.22,"grnd_level":1034.43,"humidity":81,"temp_kf":0},"weather":[{"id":803,"main":"Clouds","description":"broken clouds","icon":"04d"}],"clouds":{"all":76},"wind":{"speed":3.01,"deg":235.502},"rain":{},"sys":{"pod":"d"},"dt_txt":"2017-10-31 09:00:00"},{"dt":1509451200,"main":{"temp":10.6,"temp_min":10.6,"temp_max":10.6,"pressure":1033.36,"sea_level":1041.09,"grnd_level":1033.36,"humidity":79,"temp_kf":0},"weather":[{"id":803,"main":"Clouds","description":"broken clouds","icon":"04d"}],"clouds":{"all":56},"wind":{"speed":3.82,"deg":244},"rain":{},"sys":{"pod":"d"},"dt_txt":"2017-10-31 12:00:00"}],"city":{"id":2643743,"name":"London","coord":{"lat":51.5085,"lon":-0.1258},"country":"GB"}};