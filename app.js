let map;
let selectedLat = null;
let selectedLng = null;

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

/* BAJAR AL MAPA */
document.getElementById("verMapaBtn").onclick = () => {
  document.getElementById("map").scrollIntoView({ behavior: "smooth" });
};

/* CERRAR FORMULARIO */
document.getElementById("closeFormBtn").onclick = () => {
  document.getElementById("partyModal").style.display = "none";
};

/* SLIDER */
const slider = document.getElementById("eventoMin");
const sliderValue = document.getElementById("sliderValue");

slider.oninput = () => {
  sliderValue.innerText = slider.value + " personas";
};
