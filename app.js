mapboxgl.accessToken = "pk.eyJ1IjoiZG9uZGVlc3BlMi0iLCJhIjoiY21pNDgxOGZ2MGRubzJrbzV2Y3AyNmU1biJ9.rJ6hW4zLyWqk3a-m3IuHkQ";

let selectedLat = null;
let selectedLng = null;

const map = new mapboxgl.Map({
  container: "map",
  style: "mapbox://styles/mapbox/streets-v12", // MAPA BLANCO 2D (tipo Google)
  center: [-77.042793, -12.046374], // Lima
  zoom: 12
});

/* BAJAR AL MAPA CUANDO EL USUARIO PRESIONA EL BOTÓN */
document.getElementById("verMapaBtn").onclick = () => {
  document.getElementById("map").scrollIntoView({ behavior: "smooth" });

  // pequeño retraso para asegurar que el mapa se ajuste bien
  setTimeout(() => {
    map.resize();
  }, 200);
};

/* ABRIR FORMULARIO AL CLIC DEL MAPA */
map.on("click", (e) => {
  selectedLat = e.lngLat.lat;
  selectedLng = e.lngLat.lng;

  document.getElementById("partyModal").style.display = "flex";
});

/* CERRAR FORMULARIO */
document.getElementById("closeFormBtn").onclick = () => {
  document.getElementById("partyModal").style.display = "none";
};

/* SLIDER (ya funcionando fino) */
const slider = document.getElementById("eventoMin");
const sliderValue = document.getElementById("sliderValue");

slider.oninput = () => {
  sliderValue.innerText = slider.value + " personas";
};
