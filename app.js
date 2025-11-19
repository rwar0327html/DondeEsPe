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

/* ------------------ MAPA ------------------ */
function initMap() {
  map = new google.maps.Map(document.getElementById("map"), {
    center: { lat: -12.046374, lng: -77.042793 },
    zoom: 13,
    gestureHandling: "greedy",
    mapTypeId: "roadmap"
  });

  // ABRIR FORMULARIO AL TOCAR EL MAPA
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

/* ------------------ PUBLICAR FIESTA ------------------ */
document.getElementById("publicarBtn").onclick = () => {
  if (!selectedLat || !selectedLng) return;

  const tipoFiesta = document.getElementById("eventoTipo").value;

  new google.maps.Marker({
    position: { lat: selectedLat, lng: selectedLng },
    map,
    icon: {
      url: iconosFiesta[tipoFiesta],
      scaledSize: new google.maps.Size(40, 40), // tamaño del icono
    }
  });

  document.getElementById("partyModal").style.display = "none";
};
