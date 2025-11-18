mapboxgl.accessToken = "pk.eyJ1IjoiZG9uZGVlc3BlMi0iLCJhIjoiY21pNDgxOGZ2MGRubzJrbzV2Y3AyNmU1biJ9.rJ6hW4zLyWqk3a-m3IuHkQ";

// Crear mapa
const map = new mapboxgl.Map({
  container: "map",
  style: "mapbox://styles/mapbox/streets-v12",
  center: [-77.0428, -12.0464], // Lima
  zoom: 14,
  pitch: 60,   // inclinación 3D
  bearing: -20 // rotación inicial
});

// Activar edificios 3D
map.on("load", () => {
  const layers = map.getStyle().layers;

  const labelLayerId = layers.find(
    (layer) =>
      layer.type === "symbol" &&
      layer.layout &&
      layer.layout["text-field"]
  ).id;

  map.addLayer(
    {
      id: "3d-buildings",
      source: "composite",
      "source-layer": "building",
      filter: ["==", "extrude", "true"],
      type: "fill-extrusion",
      minzoom: 15,
      paint: {
        "fill-extrusion-color": "#aaa",
        "fill-extrusion-height": [
          "interpolate",
          ["linear"],
          ["zoom"],
          15,
          0,
          15.05,
          ["get", "height"]
        ],
        "fill-extrusion-base": [
          "interpolate",
          ["linear"],
          ["zoom"],
          15,
          0,
          15.05,
          ["get", "min_height"]
        ],
        "fill-extrusion-opacity": 0.6
      }
    },
    labelLayerId
  );
});

