mapboxgl.accessToken = "pk.eyJ1IjoiZG9uZGVlc3BlMi0iLCJhIjoiY21pNDgxOGZ2MGRubzJrbzV2Y3AyNmU1biJ9.rJ6hW4zLyWqk3a-m3IuHkQ";

const map = new mapboxgl.Map({
  container: "map",
  style: "mapbox://styles/mapbox/streets-v12",   // MAPA BLANCO
  center: [-77.042793, -12.046374],
  zoom: 12
});

/* VARIABLES */
let selectedLat = null;
let selectedLng = null;

/* MOSTRAR MAPA */
document.getElementById("verMapaBtn").onclick = () => {
  const mapDiv = document.getElementById("map");

  mapDiv.style.display = "block";

  setTimeout(() => {
    map.resize();
  }, 200);

  mapDiv.scrollIntoView({ behavior: "smooth" });
};

/* MODAL */
const modal = document.getElementById("partyModal");
document.getElementById("closeFormBtn").onclick = () => modal.style.display = "none";

/* SLIDER */
const slider = document.getElementById("eventoMin");
const sliderValue = document.getElementById("sliderValue");
slider.oninput = () => sliderValue.innerText = slider.value + " personas";

/* ABRIR MODAL AL CLIC DEL MAPA */
map.on("click", (e) => {
  selectedLat = e.lngLat.lat;
  selectedLng = e.lngLat.lng;

  modal.style.display = "flex";
});
