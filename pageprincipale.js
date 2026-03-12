
let ville = document.querySelector("h2");
let date = document.querySelector(".date-tag");
let max = document.querySelector(".max");
let min = document.querySelector(".min");
let temperature_actuelle = document.querySelector("#temperature");
let longitude_text = document.querySelector("#lon-display");
let latitude_text = document.querySelector("#lat-display");
let ressenti = document.querySelector(".feels");

let icone_meteo = document.querySelector(".big-emoji");


let data = null;

async function ApiInitialisation() {
    try {
        const response = await fetch('https://api.open-meteo.com/v1/forecast?latitude=47.5943&longitude=1.3291&hourly=temperature_2m&models=meteofrance_seamless&daily=weathercode,temperature_2m_max,temperature_2m_min');
        data = await response.json();

        console.log("Données reçues !");

        // affichage des fonctions 
        afficherTemperature()
        afficherVille();
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


function afficherVille() {
    if (data !== null) {
        ville.textContent = "e";
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

        max.textContent = "Max : " + Math.max(...data.hourly.temperature_2m);
        min.textContent = "Min : " + Math.min(...data.hourly.temperature_2m);
    } else {
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



function afficherGraphique() {
    if (data !== null) {
        let abscisses = data.hourly.time.slice(0, 24).map(t => t.slice(11, 16));;                  // heures
        let ordonnes = data.hourly.temperature_2m.slice(0, 24);

        let graphique = new Chart("canvas", {
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


function iconeMeteo(){
    if(data.daily.weathercode[0] == 3){
        icone_meteo.textContent = "☁️";
    }else if(data.daily.weathercode[0] == 51){
        icone_meteo.textContent = "⛅⛅";
    }else if(data.daily.weathercode[0] == 63){
        icone_meteo.textContent = "☀️⛅";
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



ApiInitialisation()