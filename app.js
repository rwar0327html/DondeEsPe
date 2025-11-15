console.log("app.js cargado correctamente ✔");

// Hacer accesibles las variables desde otros scripts
window.selectedLatLng = null;

// Esperar a que Firebase esté listo
document.addEventListener("DOMContentLoaded", () => {
  const estado = document.getElementById("estado-firebase");
  if (estado) estado.textContent = "Firebase conectado correctamente. ✔";
});

// Función para guardar fiesta
window.guardarFiesta = function(e) {
  e.preventDefault();

  if (!window.selectedLatLng) {
    alert("Primero selecciona una ubicación haciendo clic en el mapa.");
    return;
  }

  const nombre = document.getElementById("fiesta-nombre").value.trim();
  const descripcion = document.getElementById("fiesta-descripcion").value.trim();
  const fecha = document.getElementById("fiesta-fecha").value;
  const zona = document.getElementById("fiesta-zona").value;
  const capacidad = parseInt(document.getElementById("fiesta-capacidad").value, 10) || 0;

  if (!nombre || !descripcion || !fecha || !zona) {
    alert("Completa todos los campos.");
    return;
  }

  // Guardar en Firebase
  window.db.ref("fiestas").push({
    nombre,
    descripcion,
    fecha,
    zona,
    capacidadMinima: capacidad,
    lat: window.selectedLatLng.lat(),
    lng: window.selectedLatLng.lng(),
    flyerURL: "",
    estado: "pendiente",
    creadoEn: Date.now()
  });

  alert("🎉 Fiesta creada y guardada en Firebase (pendiente).");
  cerrarModalFiesta();
};

// Inicializar mapa desde app.js
window.initMap = function() {
  const mapDiv = document.getElementById("map");

  const map = new google.maps.Map(mapDiv, {
    center: { lat: -12.0464, lng: -77.0428 },
    zoom: 12,
  });

  map.addListener("click", (e) => {
    window.selectedLatLng = e.latLng;
    abrirModalFiesta();
  });

  console.log("Mapa inicializado correctamente.");
};
