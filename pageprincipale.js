
let ville = document.querySelector("h2");
let date = document.querySelector(".date-tag");
let max = document.querySelector(".max");
let min = document.querySelector(".min");
let temperature_actuelle = document.querySelector("#temperature");
let longitude_text = document.querySelector("#lon-display");
let latitude_text = document.querySelector("#lat-display");
let ressenti = document.querySelector(".feels");

let icone_meteo = document.querySelector(".big-emoji");
let input = document.querySelector("#city-input");


let data = null;


input.addEventListener("keydown", async (e) => {
    if (e.key === "Enter") {
        let ville_recherchee = input.value.trim();
        if (ville_recherchee !== "") {
            let info = await geoLocalisation(ville_recherchee);
            if (!info) {
                alert("Ville introuvable");
                return;
            }

            nomVilleActuelle = info.name;
            ville.textContent = nomVilleActuelle;


            ApiInitialisation(info.lat, info.lon);
        };
    }
})



async function geoLocalisation(ville_recherchee) {
    try {
        let reponse = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${ville_recherchee}`);
        geolocalisation = await reponse.json();

        console.log("Données reçues !");
        if (!geolocalisation.results || geolocalisation.results.length === 0) return null;

        return {
            name: geolocalisation.results[0].name,
            lat: geolocalisation.results[0].latitude,
            lon: geolocalisation.results[0].longitude
        };


    } catch (error) {
        console.error(error);
    }
}



async function ApiInitialisation(lat, long) {
    try {
        let response = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${long}&hourly=temperature_2m&models=meteofrance_seamless&daily=weathercode,temperature_2m_max,temperature_2m_min`);
        data = await response.json();

        console.log("Données reçues !");

        // affichage des fonctions 
        afficherTemperature();
        afficherLongitudeLatitude();
        afficherMaxMin();
        afficherDate();
        afficherRessenti();
        afficherGraphique();
        iconeMeteo();
        afficherPrevisions();

    } catch (error) {
        console.error(error);
    }
}


function afficherTemperature() {
    if (data !== null) {
        const heureActuelle = new Date().getHours(); // 0–23
        const temperature = data.hourly.temperature_2m[heureActuelle];

        temperature_actuelle.textContent = temperature;
    } else {
        console.log(error);
    }
}

function afficherLongitudeLatitude() {
    if (data !== null) {
        longitude_text.textContent = "Long : " + data.longitude;
        latitude_text.textContent = "Lat : " + data.latitude;
    } else {
        console.log(error);
    }
}

function afficherMaxMin() {
    if (data !== null) {

        const todayTemps = data.hourly.temperature_2m.slice(0, 24).map(Number);

        max.textContent = "Max : " + Math.max(...todayTemps);
        min.textContent = "Min : " + Math.min(...todayTemps);
    }
    else{
        console.log(error);
    }
}


function afficherDate() {
    if (data !== null) {
        const now = new Date();
        date.textContent = now.toString();
    } else {
        console.log(error);
    }
}

function afficherRessenti() {
    if (data !== null) {
        ressenti.textContent = "Ressenti : " + Math.round(Number(temperature_actuelle.textContent) - 1);
    } else {
        console.log(error);
    }

}


let graphique = null;
function afficherGraphique() {


    if (data !== null) {
        if (graphique !== null) {
            graphique.destroy();
        }

        let abscisses = data.hourly.time.slice(0, 24).map(t => t.slice(11, 16));;                  // heures
        let ordonnes = data.hourly.temperature_2m.slice(0, 24);

        graphique = new Chart("canvas", {
            type: "line",
            data: {
                labels: abscisses,
                datasets: [{
                    label: "Températures d'aujourd'hui",
                    data: ordonnes,
                }]
            },
            options: {}

        });
    } else {
        console.log(error);
    }
}



function iconFromCode(code) {
    if (code === 0) return "☀️";
    if (code <= 3) return "⛅";
    if (code <= 48) return "🌫️";
    if (code <= 57) return "🌦️";
    if (code <= 67) return "🌧️";
    if (code <= 77) return "❄️";
    if (code <= 82) return "🌧️";
    if (code <= 86) return "❄️";
    if (code <= 99) return "⛈️";
    return "❓";
}

function iconeMeteo() {
    icone_meteo.textContent = iconFromCode(data.daily.weathercode[0]);
}




function afficherPrevisions() {
    const table = document.querySelector(".forecast-table");
    table.innerHTML = "";

    const jours = ["Dim.", "Lun.", "Mar.", "Mer.", "Jeu.", "Ven.", "Sam."];

    for (let i = 0; i < 4; i++) {

        const d = new Date(data.daily.time[i]);
        const day = jours[d.getDay()];

        const icon = iconFromCode(data.daily.weathercode[i]);
        const max = Math.round(data.daily.temperature_2m_max[i]);
        const min = Math.round(data.daily.temperature_2m_min[i]);

        table.innerHTML += `
            <div class="forecast-row">
                <span class="day">${day}</span>
                <span class="sky">${icon}</span>
                <span class="range">${max}° / ${min}°</span>
            </div>
        `;
    }
}


async function start() {
    let info = await geoLocalisation("Blois");
    nomVilleActuelle = info.name;
    ApiInitialisation(info.lat, info.lon);
}

start();
