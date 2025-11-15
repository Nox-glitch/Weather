class WeatherApp {
    constructor() {
        this.apiKey = "e36f541787664f561c41e6d9ae477761";
        this.weatherUrl = "https://api.openweathermap.org/data/2.5/weather";
        this.forecastUrl = "https://api.openweathermap.org/data/2.5/onecall";

        this.recentSearches = JSON.parse(localStorage.getItem("recentSearches")) || [];

        this.elements = {
            cityInput: document.getElementById("cityInput"),
            searchBtn: document.getElementById("searchBtn"),
            themeToggle: document.getElementById("themeToggle"),
            recentList: document.getElementById("recentList"),

            error: document.getElementById("errorMessage"),
            loading: document.getElementById("loading"),

            weatherInfo: document.getElementById("weatherInfo"),
            cityName: document.getElementById("cityName"),
            temp: document.getElementById("currentTemp"),
            desc: document.getElementById("weatherDescription"),
            feels: document.getElementById("feelsLike"),
            humidity: document.getElementById("humidity"),
            wind: document.getElementById("windSpeed"),
            icon: document.getElementById("weatherIcon"),

            forecastSection: document.getElementById("forecast"),
            forecastGrid: document.getElementById("forecastContainer"),

            background: document.getElementById("backgroundAnimation"),
        };

        this.init();
    }

    init() {
        this.bindEvents();
        this.renderRecent();
        this.getWeather("London");
    }

    bindEvents() {
        this.elements.searchBtn.onclick = () => this.handleSearch();

        this.elements.cityInput.addEventListener("keypress", e => {
            if (e.key === "Enter") this.handleSearch();
        });

        this.elements.themeToggle.onchange = () => {
            document.body.classList.toggle("dark");
        };
    }

    handleSearch() {
        const city = this.elements.cityInput.value.trim();
        if (city) {
            this.getWeather(city);
            this.elements.cityInput.value = "";
        }
    }

    /** FETCH CURRENT WEATHER **/
    async getWeather(city) {
        this.showLoading();
        this.hideError();
        this.hideWeather();

        try {
            const res = await fetch(
                `${this.weatherUrl}?q=${city}&appid=${this.apiKey}&units=metric`
            );

            if (!res.ok) throw new Error();

            const data = await res.json();
            this.displayCurrentWeather(data);

            const { lat, lon } = data.coord;
            this.getForecast(lat, lon);

            this.addRecent(city);

        } catch (err) {
            this.showError();
        }
    }

    /** FETCH 7 DAY FORECAST **/
    async getForecast(lat, lon) {
        const res = await fetch(
            `${this.forecastUrl}?lat=${lat}&lon=${lon}&units=metric&appid=${this.apiKey}`
        );

        const data = await res.json();

        this.displayForecast(data.daily.slice(1, 8));  
    }

    displayCurrentWeather(data) {
        this.hideLoading();
        this.showWeather();

        // UI Update
        this.elements.cityName.textContent = `${data.name}, ${data.sys.country}`;
        this.elements.temp.textContent = Math.round(data.main.temp);
        this.elements.desc.textContent = data.weather[0].description;
        this.elements.feels.textContent = `${Math.round(data.main.feels_like)}°C`;
        this.elements.humidity.textContent = `${data.main.humidity}%`;
        this.elements.wind.textContent = `${data.wind.speed} m/s`;

        // ICON
        this.renderLottieIcon(data.weather[0].main.toLowerCase());

        // DYNAMIC BACKGROUND
        this.setBackground(data.weather[0].main);
    }

    /** LOTTIE ICONS **/
    renderLottieIcon(condition) {
        const icons = {
            clear: "https://assets10.lottiefiles.com/packages/lf20_rpC3aK.json",
            clouds: "https://assets10.lottiefiles.com/packages/lf20_VAmWRg.json",
            rain: "https://assets2.lottiefiles.com/private_files/lf30_p3pdvmsf.json",
            snow: "https://assets5.lottiefiles.com/packages/lf20_EiZ2JZ.json",
            thunderstorm: "https://assets5.lottiefiles.com/packages/lf20_jmBauI.json",
            mist: "https://assets10.lottiefiles.com/packages/lf20_o5vjXc.json",
        };

        const url = icons[condition] || icons["clear"];

        this.elements.icon.innerHTML = "";
        lottie.loadAnimation({
            container: this.elements.icon,
            renderer: "svg",
            loop: true,
            autoplay: true,
            path: url
        });
    }

    /** DYNAMIC BACKGROUND **/
    setBackground(condition) {
        const backgrounds = {
            Clear: "linear-gradient(120deg,#ffecd2,#fcb69f)",
            Clouds: "linear-gradient(120deg,#d7d2cc,#304352)",
            Rain: "linear-gradient(120deg,#4b79a1,#283e51)",
            Snow: "linear-gradient(120deg,#e6dada,#274046)",
            Thunderstorm: "linear-gradient(120deg,#232526,#414345)",
            Mist: "linear-gradient(120deg,#3e5151,#decba4)"
        };

        this.elements.background.style.background = backgrounds[condition] || backgrounds["Clear"];
    }

    /** DISPLAY FORECAST **/
    displayForecast(days) {
        this.elements.forecastGrid.innerHTML = "";

        days.forEach(day => {
            const date = new Date(day.dt * 1000);
            const name = date.toLocaleDateString("en-US", { weekday: "short" });

            const card = document.createElement("div");
            card.className = "forecast-card";

            card.innerHTML = `
                <div class="forecast-day">${name}</div>
                <img class="forecast-icon" src="https://openweathermap.org/img/wn/${day.weather[0].icon}@2x.png">
                <div class="forecast-temp">${Math.round(day.temp.day)}°C</div>
            `;

            this.elements.forecastGrid.appendChild(card);
        });

        this.elements.forecastSection.classList.remove("hidden");
    }

    /************* RECENT SEARCHES *************/
    addRecent(city) {
        this.recentSearches = this.recentSearches.filter(c => c.toLowerCase() !== city.toLowerCase());
        this.recentSearches.unshift(city);
        this.recentSearches = this.recentSearches.slice(0, 5);

        localStorage.setItem("recentSearches", JSON.stringify(this.recentSearches));

        this.renderRecent();
    }

    renderRecent() {
        this.elements.recentList.innerHTML = "";

        this.recentSearches.forEach(city => {
            const div = document.createElement("div");
            div.className = "recent-item";
            div.textContent = city;

            div.onclick = () => this.getWeather(city);
            this.elements.recentList.appendChild(div);
        });
    }

    /************* UI HELPERS *************/
    showLoading() {
        this.elements.loading.classList.remove("hidden");
    }

    hideLoading() {
        this.elements.loading.classList.add("hidden");
    }

    showWeather() {
        this.elements.weatherInfo.classList.remove("hidden");
    }

    hideWeather() {
        this.elements.weatherInfo.classList.add("hidden");
    }

    showError() {
        this.elements.error.classList.remove("hidden");
        this.hideLoading();
    }

    hideError() {
        this.elements.error.classList.add("hidden");
    }
}

new WeatherApp();
