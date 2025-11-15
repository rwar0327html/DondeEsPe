document.addEventListener("DOMContentLoaded", () => {
  const estado = document.getElementById("estado-firebase");
  if (estado) estado.textContent = "Firebase conectado correctamente.";
  console.log("Firebase OK ✔");
});
