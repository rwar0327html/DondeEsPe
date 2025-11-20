/* ============================================================
   🔥 1. FIREBASE CONFIG REALTIME DATABASE
   ============================================================ */
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-app.js";
import { getDatabase, ref, push, set, onValue } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyCgFLYXdggm6O2zpNnYCzGvZFm8WKnExVE",
  authDomain: "dondeespe-546a3.firebaseapp.com",
  databaseURL: "https://dondeespe-546a3-default-rtdb.firebaseio.com",
  projectId: "dondeespe-546a3",
  storageBucket: "dondeespe-546a3.appspot.com",
  messagingSenderId: "734681969663",
  appId: "1:734681969663:web:dc34cbb8a19c6323fb3f12"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);


/* ============================================================
   🔥 2. VARIABLES DEL MAPA
   ============================================================ */
let map;
let selectedLat = null;
let selectedLng = null;

/* ============================================================
   🔥 3. ICONOS PERSONALIZADOS
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
   🔥 4. INICIAR MAPA
   ============================================================ */
window.initMap = function () {
  map = new google.maps.Map(document.getElementById("map"), {
    center: { lat: -12.046374, lng: -77.042793 },
    zoom: 13,
    gestureHandling: "greedy",
    mapTypeId: "roadmap"
  });

  map.addListener("click", (e) => {
    selectedLat = e.latLng.lat();
    selectedLng = e.latLng.lng();
    document.getElementById("partyModal").style.display = "flex";
  });

  cargarFiestas();
};


/* ============================================================
   🔥 5. CARGAR FIESTAS DESDE REALTIME DATABASE
   ============================================================ */
function cargarFiestas() {
  const refFiestas = ref(db, "fiestas");

  onValue(refFiestas, (snapshot) => {
    const data = snapshot.val();
    if (!data) return;

    Object.values(data).forEach((fiesta) => {

      const marker = new google.maps.Marker({
        position: { lat: fiesta.lat, lng: fiesta.lng },
        map,
        icon: crearIconoAnimado(iconosFiesta[fiesta.tipo])
      });

      marker.addListener("click", () => mostrarTarjeta(fiesta));
    });
  });
}

/* ============================================================
   🔥 6. TARJETA BLACK PREMIUM
   ============================================================ */
function mostrarTarjeta(f) {
  document.getElementById("partyFlyer").src = f.flyer;
  document.getElementById("partyName").textContent = f.nombre;
  document.getElementById("partyDesc").textContent = f.descripcion;
  document.getElementById("partyZone").textContent = "Zona: " + f.zona;
  document.getElementById("partyMin").textContent = "Mínimo: " + f.minimo + " personas";

  const card = document.getElementById("partyCard");
  card.classList.add("show");
}


/* ============================================================
   🔥 7. GUARDAR FIESTA (REALTIME DATABASE)
   ============================================================ */
document.getElementById("publicarBtn").onclick = async () => {

  if (!selectedLat || !selectedLng) return alert("Toca el mapa para elegir ubicación.");

  const tipoFiesta = document.getElementById("eventoTipo").value;
  const nombre = document.getElementById("eventoNombre").value;
  const descripcion = document.getElementById("eventoDescripcion").value;
  const flyer = document.getElementById("eventoFlyer").value;
  const zona = document.getElementById("eventoZona").value;
  const minimo = slider.value;

  const fiestaData = {
    tipo: tipoFiesta,
    nombre,
    descripcion,
    flyer,
    zona,
    minimo,
    lat: selectedLat,
    lng: selectedLng,
    creado: Date.now()
  };

  const refFiestas = ref(db, "fiestas");
  await push(refFiestas, fiestaData);

  alert("✔ Fiesta publicada");

  document.getElementById("partyModal").style.display = "none";
};


/* ============================================================
   🔥 8. SLIDER
   ============================================================ */
const slider = document.getElementById("eventoMin");
const sliderValue = document.getElementById("sliderValue");
slider.oninput = () => {
  sliderValue.innerText = slider.value + " personas";
};


/* ============================================================
   🔥 9. BOTONES SECUNDARIOS
   ============================================================ */
document.getElementById("closeFormBtn").onclick = () => {
  document.getElementById("partyModal").style.display = "none";
};

document.getElementById("verMapaBtn").onclick = () => {
  document.getElementById("map").scrollIntoView({ behavior: "smooth" });
};
