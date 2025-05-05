// declaring a function to get the weater based on the city entered in the index.html
function getWeather() {
    const city = document.getElementById("cityInput").value;
    const resultDiv = document.getElementById("weatherResult");
  
    if (!city) {
      resultDiv.innerHTML = "<p>Please enter a city.</p>";
      return;
    }
  
// searching for the city name and geocoding api to get lat/lon
    fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${city}`)
        .then(response => response.json())
        .then(data => {
            if (!data.results || data.results.length === 0) {
            throw new Error("City not found.");
            }
  
            const { latitude, longitude, name, country } = data.results[0];
  
// get weather from the open-meteo api after fining the city's latitude, longitude etc.
            return fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`)
            .then(response => response.json())
            .then(weatherData => {
                const weather = weatherData.current_weather;
                resultDiv.innerHTML = `
                <h2>${name}, ${country}</h2>
                <p>🌡️ Temperature: ${weather.temperature}°C</p>
                <p>💨 Wind: ${weather.windspeed} km/h</p>
                <p>🕒 Time: ${weather.time}</p>
                `;
            });
        })
//catching possible failure of the function
      .catch(err => {
        resultDiv.innerHTML = `<p>Error: ${err.message}</p>`;
      });
}

//TEST replace the onclick function in the index.html to runtests() to check different cases if the website and the api call are functional
function assertEqual(actual, expected, description) {
    const result = actual === expected ? "✅ PASS" : `❌ FAIL (Expected: ${expected}, Got: ${actual})`;
    console.log(`${description}: ${result}`);
}

function runTests() {
    // Test 1: City input empty
    document.getElementById("cityInput").value = "";
    getWeather(); // Calls your app function
    const output1 = document.getElementById("weatherResult").innerText;
    assertEqual(output1.includes("Please enter a city."), true, "Empty city input shows error");

    // Test 2: Mock override the fetch with an expected result to check if all parameters are consistent
    const mockGeocode = {
      results: [{ latitude: 40.7, longitude: -74.0, name: "New York", country: "USA" }]
    };

    const mockWeather = {
      current_weather: { temperature: 20, windspeed: 10, time: "2025-05-05T12:00" }
    };

    window.fetch = (url) => {
      return Promise.resolve({
        json: () => {
          if (url.includes("geocoding")) return Promise.resolve(mockGeocode);
          else return Promise.resolve(mockWeather);
        }
      });
    };

    document.getElementById("cityInput").value = "New York";
    getWeather();

    setTimeout(() => {
      const output2 = document.getElementById("weatherResult").innerText;
      assertEqual(output2.includes("New York"), true, "Valid city shows weather info");
      assertEqual(output2.includes("20°C") || output2.includes("20"), true, "Correct temperature shown");
    }, 1000); 
}