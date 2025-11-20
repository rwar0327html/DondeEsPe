/* ============================================================
   1. FIREBASE REALTIME DATABASE
============================================================ */
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-app.js";
import { getDatabase, ref, push } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyBamKskyem2u7YN26rMh4lUPqK3aPlTDuE",
  authDomain: "dondeespe-546a3.firebaseapp.com",
  databaseURL: "https://dondeespe-546a3-default-rtdb.firebaseio.com",
  projectId: "dondeespe-546a3",
  storageBucket: "dondeespe-546a3.firebasestorage.app",
  messagingSenderId: "413412307464",
  appId: "1:413412307464:web:48b9e633e9c3f82714d7bd"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

/* ============================================================
   2. VARIABLES DEL MAPA
============================================================ */
let map;
let selectedLat = null;
let selectedLng = null;

/* ============================================================
   3. ICONOS PERSONALIZADOS
============================================================ */
const iconosFiesta = {
  discoteca: "https://rwar0327html.github.io/DondeEsPe/copa.png",
  rave:       "https://rwar0327html.github.io/DondeEsPe/dj.png",
  masiva:     "https://rwar0327html.github.io/DondeEsPe/fuego.png",
  concierto:  "https://rwar0327html.github.io/DondeEsPe/microfono.png"
};

function crearIconoAnimado(url) {
  return {
    url: url,
    scaledSize: new google.maps.Size(40, 40),
    anchor: new google.maps.Point(20, 20)
  };
}

/* ============================================================
   4. INICIAR MAPA
============================================================ */
window.initMap = function () {
  map = new google.maps.Map(document.getElementById("map"), {
    center: { lat: -12.046374, lng: -77.042793 },
    zoom: 13,
    gestureHandling: "greedy",
    mapTypeId: "roadmap"
  });

  // Abrir formulario al tocar el mapa
  map.addListener("click", (e) => {
    selectedLat = e.latLng.lat();
    selectedLng = e.latLng.lng();
    document.getElementById("partyModal").style.display = "flex";
  });
};

/* ============================================================
   5. BOTÓN "VER MAPA"
============================================================ */
document.getElementById("verMapaBtn").onclick = () => {
  document.getElementById("map").scrollIntoView({ behavior: "smooth" });
};

/* ============================================================
   6. CERRAR FORMULARIO
============================================================ */
document.getElementById("closeFormBtn").onclick = () => {
  document.getElementById("partyModal").style.display = "none";
};

/* ============================================================
   7. SLIDER
============================================================ */
const slider = document.getElementById("eventoMin");
const sliderValue = document.getElementById("sliderValue");

slider.oninput = () => {
  sliderValue.innerText = slider.value + " personas";
};

/* ============================================================
   8. PUBLICAR FIESTA (🔥 REALTIME DATABASE)
============================================================ */
document.getElementById("publicarBtn").onclick = async () => {
  if (!selectedLat || !selectedLng) return alert("Selecciona un punto en el mapa");

  const tipo = document.getElementById("eventoTipo").value;

  const fiestaData = {
    tipo,
    lat: selectedLat,
    lng: selectedLng,
    minimo: slider.value,
    creado: Date.now()
  };

  // Guardar en REALETIME DATABASE
  const fiestasRef = ref(db, "fiestas");
  await push(fiestasRef, fiestaData);

  alert("✔ Fiesta publicada correctamente");

  // Marcar en el mapa
  const marker = new google.maps.Marker({
    position: { lat: selectedLat, lng: selectedLng },
    map,
    icon: crearIconoAnimado(iconosFiesta[tipo])
  });

  document.getElementById("partyModal").style.display = "none";
};
