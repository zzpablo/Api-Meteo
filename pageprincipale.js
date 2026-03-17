console.log("JS chargé");


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
let nomVilleActuelle = "";

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
        if (!geolocalisation.results || geolocalisation.results.length === 0) {
            return null;
        } else {
            return {
                name: geolocalisation.results[0].name,
                lat: geolocalisation.results[0].latitude,
                lon: geolocalisation.results[0].longitude
            };

        }




    } catch (error) {
        console.error(error);
    }
}



let unite = "celsius";

let celciusBtn = document.querySelector(".active");
let farenBtn = document.querySelector(".farenheit");

celciusBtn.addEventListener("click", () => {
    unite = "celsius";
    celciusBtn.classList.add("active");
    farenBtn.classList.remove("active");

    ApiInitialisation(data.latitude, data.longitude, unite);
});


farenBtn.addEventListener("click", () => {
    unite = "fahrenheit";
    farenBtn.classList.add("active");
    celciusBtn.classList.remove("active");

    ApiInitialisation(data.latitude, data.longitude, unite);
});


async function ApiInitialisation(lat, long, unite = "celsius") {
    try {
        let response = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${long}&hourly=temperature_2m&models=meteofrance_seamless&daily=weathercode,temperature_2m_max,temperature_2m_min&temperature_unit=${unite}`);
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
    else {
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
                    label: "Températures : Aujourd’hui",
                    data: ordonnes,
                }]
            },
            options: {}


        });
    } else {
        console.log(error);
    }
}


function afficherGraphiquePourJour(jourIndex) {
    if (!data) return;

    let start = jourIndex * 24;
    let end = start + 24;

    let abscisses = data.hourly.time.slice(start, end).map(t => t.slice(11, 16));
    let ordonnes = data.hourly.temperature_2m.slice(start, end);

    graphique.data.labels = abscisses;
    graphique.data.datasets[0].data = ordonnes;

    let noms = ["Aujourd’hui", "Demain", "Après‑demain", "Après Après-demain"];
    graphique.data.datasets[0].label = `Températures : ${noms[jourIndex]}`;

    graphique.update();
}



let statsCheck = document.querySelector(".card-options label:nth-child(1) input");
let prevCheck = document.querySelector(".card-options label:nth-child(2) input");

let statsSection = document.querySelector(".chart-box");
let prevSection = document.querySelector(".forecast-section");

statsCheck.addEventListener("change", () => {
    statsSection.style.display = statsCheck.checked ? "block" : "none";
});

prevCheck.addEventListener("change", () => {
    prevSection.style.display = prevCheck.checked ? "block" : "none";
});



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
    let table = document.querySelector(".forecast-table");
    table.innerHTML = "";

    let jours = ["Dim.", "Lun.", "Mar.", "Mer.", "Jeu.", "Ven.", "Sam."];

    for (let i = 0; i < 4; i++) {

        let d = new Date(data.daily.time[i]);
        let day = jours[d.getDay()];

        let icon = iconFromCode(data.daily.weathercode[i]);
        let max = Math.round(data.daily.temperature_2m_max[i]);
        let min = Math.round(data.daily.temperature_2m_min[i]);

        table.innerHTML += `
            <div class="forecast-row" data-day="${i}">
                <span class="day">${day}</span>
                <span class="sky">${icon}</span>
                <span class="range">${max}° / ${min}°</span>
            </div>
        `;
    }



    
    document.querySelectorAll(".forecast-row").forEach(row => {
        row.addEventListener("click", () => {
            let jour = Number(row.dataset.day);
            afficherGraphiquePourJour(jour);
        });
    });
}



async function start() {
    let info = await geoLocalisation("Blois");
    nomVilleActuelle = info.name;
    ApiInitialisation(info.lat, info.lon);
}

start();


let favoris = JSON.parse(localStorage.getItem("favoris")) || [];

let save = document.querySelector(".save-btn");
let list = document.getElementById("favorites-list");

function afficherFavoris() {
    list.innerHTML = favoris.map(ville => `<li class="fav-item">${ville}</li>`).join("");

    document.querySelectorAll(".fav-item").forEach(li => {
        li.addEventListener("click", async () => {
            let ville_recherchee = li.textContent;

            let info = await geoLocalisation(ville_recherchee);
            if (!info) return;

            nomVilleActuelle = info.name;
            ville.textContent = nomVilleActuelle;

            ApiInitialisation(info.lat, info.lon);

        });
    });
}

save.addEventListener("click", () => {
    console.log(nomVilleActuelle);

    if (!nomVilleActuelle) return;
    if (!favoris.includes(nomVilleActuelle)) {
        favoris.push(nomVilleActuelle);
        localStorage.setItem("favoris", JSON.stringify(favoris));
        afficherFavoris();
    }
});


afficherFavoris();


