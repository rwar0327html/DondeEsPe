mapboxgl.accessToken = "pk.eyJ1IjoiZG9uZGVlc3BlMi0iLCJhIjoiY21pNDgxOGZ2MGRubzJrbzV2Y3AyNmU1biJ9.rJ6hW4zLyWqk3a-m3IuHkQ";

const map = new mapboxgl.Map({
  container: "map",
  style: "mapbox://styles/mapbox/dark-v11",
  center: [-77.042793, -12.046374], 
  zoom: 12
});

/* VARIABLES PARA GUARDAR LA UBICACIÓN SELECCIONADA */
let selectedLat = null;
let selectedLng = null;

/* SCROLL AL MAPA DESDE EL HERO */
document.getElementById("verMapaBtn").onclick = () => {
  document.getElementById("map").scrollIntoView({ behavior: "smooth" });
};

/* MODAL */
const modal = document.getElementById("partyModal");
const openFormBtn = document.getElementById("openFormBtn");
const closeFormBtn = document.getElementById("closeFormBtn");

openFormBtn.onclick = () => modal.style.display = "flex";
closeFormBtn.onclick = () => modal.style.display = "none";

/* SLIDER */
const slider = document.getElementById("eventoMin");
const sliderValue = document.getElementById("sliderValue");

slider.max = 1000; // MÁXIMO 1000 PERSONAS

slider.oninput = () => {
  sliderValue.innerText = slider.value + " personas";
};

/* ABRIR FORMULARIO AL TOCAR EL MAPA */
map.on("click", (e) => {
  selectedLat = e.lngLat.lat;
  selectedLng = e.lngLat.lng;

  modal.style.display = "flex";
});

/* PUBLICAR FIESTA */
document.getElementById("enviarFiesta").onclick = () => {
  const nombre = document.getElementById("eventoNombre").value;
  const descripcion = document.getElementById("eventoDescripcion").value;
  const fecha = document.getElementById("eventoFecha").value;
  const zona = document.getElementById("eventoZona").value;
  const minimo = slider.value;

  if (!nombre || !descripcion || !fecha || !zona || !selectedLat || !selectedLng) {
    alert("Completa todos los campos.");
    return;
  }

  /* CREAR TARJETA DE FIESTA EN EL MAPA */
  const htmlPopup = `
    <div style="
      font-family:Poppins;
      color:white;
      padding:10px;
      border-radius:10px;
      background:black;
      border:2px solid #ffd700;
      box-shadow:0 0 10px #ffd700;
    ">
      <h3 style="margin:0 0 5px 0; color:#ffd700;">${nombre}</h3>
      <p style="margin:0; font-size:13px;">${descripcion}</p>
      <p style="margin:5px 0 0 0; font-size:12px;">📍 ${zona}</p>
      <p style="margin:5px 0 0 0; font-size:12px;">🎉 Mínimo: ${minimo} personas</p>
      <p style="margin:5px 0 0 0; font-size:12px;">📅 ${fecha}</p>
    </div>
  `;

  new mapboxgl.Marker({
    color: "#ffd700"
  })
    .setLngLat([selectedLng, selectedLat])
    .setPopup(new mapboxgl.Popup().setHTML(htmlPopup))
    .addTo(map);

  modal.style.display = "none";

  /* LIMPIAR FORMULARIO */
  document.getElementById("eventoNombre").value = "";
  document.getElementById("eventoDescripcion").value = "";
  document.getElementById("eventoFecha").value = "";
  document.getElementById("eventoZona").value = "Barranco";
  slider.value = 0;
  sliderValue.innerText = "0 personas";

  alert("Fiesta creada (modo demo). Cuando activemos Firebase quedará guardada.");
};
