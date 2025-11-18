mapboxgl.accessToken = "pk.eyJ1IjoiZG9uZGVlc3BlMi0iLCJhIjoiY21pNDgxOGZ2MGRubzJrbzV2Y3AyNmU1biJ9.rJ6hW4zLyWqk3a-m3IuHkQ";

const map = new mapboxgl.Map({
  container: "map",
  style: "mapbox://styles/mapbox/dark-v11",   // MAPA OSCURO REAL
  center: [-77.042793, -12.046374],           // Lima
  zoom: 12
});

/* SCROLL A MAPA */
document.getElementById("verMapaBtn").onclick = () => {
  document.getElementById("map").scrollIntoView({ behavior: "smooth" });
};

/* MODAL */
const modal = document.getElementById("partyModal");
document.getElementById("openFormBtn").onclick = () => modal.style.display = "flex";
document.getElementById("closeFormBtn").onclick = () => modal.style.display = "none";

/* SLIDER */
const slider = document.getElementById("eventoMin");
const sliderValue = document.getElementById("sliderValue");

slider.oninput = () => {
  sliderValue.innerText = slider.value + " personas";
};
