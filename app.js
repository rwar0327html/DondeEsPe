console.log("DondeEsPe conectado correctamente.");

document.addEventListener("DOMContentLoaded", () => {
  const estado = document.getElementById("estado-firebase");

  try {
    if (typeof firebase !== "undefined") {
      estado.textContent = "✅ Firebase conectado correctamente.";
      console.log("Firebase cargado:", firebase);
    } else {
      estado.textContent = "❌ Firebase NO está cargado.";
      console.error("No se encontró Firebase.");
    }
  } catch (error) {
    estado.textContent = "❌ Error conectando Firebase.";
    console.error(error);
  }
});
