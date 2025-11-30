class WeatherApp {
    constructor() {
        this.apiKey = "e36f541787664f561c41e6d9ae477761";
        this.weatherUrl = "https://api.openweathermap.org/data/2.5/weather";

        this.el = {
            input: document.getElementById("cityInput"),
            btn: document.getElementById("searchBtn"),
            info: document.getElementById("weatherInfo"),

            name: document.getElementById("cityName"),
            temp: document.getElementById("currentTemp"),
            desc: document.getElementById("weatherDescription"),
            feels: document.getElementById("feelsLike"),
            humidity: document.getElementById("humidity"),
            wind: document.getElementById("windSpeed"),
            icon: document.getElementById("weatherIcon"),
        };

        this.init();
    }

    init() {
        this.el.btn.onclick = () => this.search();
        this.el.input.addEventListener("keypress", e => {
            if (e.key === "Enter") this.search();
        });

        this.getWeather("London"); // Default city
    }

    search() {
        const city = this.el.input.value.trim();
        if (city) {
            this.getWeather(city);
            this.el.input.value = "";
        }
    }

    async getWeather(city) {
        try {
            const res = await fetch(
                `${this.weatherUrl}?q=${city}&appid=${this.apiKey}&units=metric`
            );

            if (!res.ok) return;

            const data = await res.json();
            this.display(data);

        } catch (err) {
            console.log("Error fetching weather");
        }
    }

    display(data) {
        this.el.info.classList.remove("hidden");

        this.el.name.textContent = `${data.name}, ${data.sys.country}`;
        this.el.temp.textContent = Math.round(data.main.temp);
        this.el.desc.textContent = data.weather[0].description;
        this.el.feels.textContent = `${Math.round(data.main.feels_like)}°C`;
        this.el.humidity.textContent = `${data.main.humidity}%`;
        this.el.wind.textContent = `${data.wind.speed} m/s`;

        this.loadIcon(data.weather[0].main.toLowerCase());
    }

    loadIcon(condition) {
        const icons = {
            clear: "https://assets10.lottiefiles.com/packages/lf20_rpC3aK.json",
            clouds: "https://assets10.lottiefiles.com/packages/lf20_VAmWRg.json",
            rain: "https://assets2.lottiefiles.com/private_files/lf30_p3pdvmsf.json",
            snow: "https://assets5.lottiefiles.com/packages/lf20_EiZ2JZ.json",
            thunderstorm: "https://assets5.lottiefiles.com/packages/lf20_jmBauI.json",
            mist: "https://assets10.lottiefiles.com/packages/lf20_o5vjXc.json",
        };

        const url = icons[condition] || icons.clear;

        this.el.icon.innerHTML = "";
        lottie.loadAnimation({
            container: this.el.icon,
            renderer: "svg",
            loop: true,
            autoplay: true,
            path: url,
        });
    }
}

new WeatherApp();
