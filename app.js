let map;
let selectedLat = null;
let selectedLng = null;

/* ------------------ ICONOS PERSONALIZADOS ------------------ */
const iconosFiesta = {
  discoteca: "https://rwar0327html.github.io/DondeEsPe/copa.png",
  rave:       "https://rwar0327html.github.io/DondeEsPe/dj.png",
  masiva:     "https://rwar0327html.github.io/DondeEsPe/fuego.png",
  concierto:  "https://rwar0327html.github.io/DondeEsPe/microfono.png"
};

/* ------------------ FUNCIÓN CREAR ICONO ANIMADO ------------------ */
function crearIconoAnimado(url) {
  return {
    url: url,
    scaledSize: new google.maps.Size(40, 40),
    anchor: new google.maps.Point(20, 20)
  };
}

/* ------------------ MAPA ------------------ */
function initMap() {
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
}

/* ------------------ BOTÓN "VER MAPA" ------------------ */
document.getElementById("verMapaBtn").onclick = () => {
  document.getElementById("map").scrollIntoView({ behavior: "smooth" });
};

/* ------------------ CERRAR FORMULARIO ------------------ */
document.getElementById("closeFormBtn").onclick = () => {
  document.getElementById("partyModal").style.display = "none";
};

/* ------------------ SLIDER ------------------ */
const slider = document.getElementById("eventoMin");
const sliderValue = document.getElementById("sliderValue");

slider.oninput = () => {
  sliderValue.innerText = slider.value + " personas";
};

/* ------------------ PUBLICAR FIESTA (FIREBASE + MAPA) ------------------ */
document.getElementById("publicarBtn").onclick = async () => {
  if (!selectedLat || !selectedLng) return;

  const tipoFiesta = document.getElementById("eventoTipo").value;
  const icono = crearIconoAnimado(iconosFiesta[tipoFiesta]);

  /* ---------- GUARDAR FIESTA EN FIRESTORE ---------- */
  await db.collection("fiestas").add({
    tipo: tipoFiesta,
    lat: selectedLat,
    lng: selectedLng,
    minimo: slider.value,
    creado: Date.now()
  });

  console.log("Fiesta guardada en Firebase ✔");

  /* ---------- AGREGAR MARKER EN EL MAPA ---------- */
  const marker = new google.maps.Marker({
    position: { lat: selectedLat, lng: selectedLng },
    map,
    icon: icono
  });

  // Animación
  const markerURL = marker.getIcon().url;
  setTimeout(() => {
    const imgs = document.querySelectorAll(`img[src="${markerURL}"]`);
    imgs.forEach(img => img.classList.add("floating-icon"));
  }, 300);

  document.getElementById("partyModal").style.display = "none";
};
