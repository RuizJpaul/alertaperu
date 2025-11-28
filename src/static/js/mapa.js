// map.js
fetch("/static/geojson/peru.json")
  .then(res => res.json())
  .then(data => {
    const map = L.map("map_container", {
      dragging: false,
      scrollWheelZoom: false,
      doubleClickZoom: false,
      boxZoom: false,
      keyboard: false,
      touchZoom: false
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap contributors",
    }).addTo(map);

    const geoJsonLayer = L.geoJSON(data, {
      style: {
        color: "#1e88e5",
        weight: 2,
        fillColor: "#42a5f5",
        fillOpacity: 0.5,
      },
      onEachFeature: function(feature, layer) {
        layer.on("click", function() {
          const departamento = feature.properties.NAME_1;

          // Mostrar contenedor de pestañas
          const infoContainer = document.getElementById("info_container");
          infoContainer.querySelector(".info_tabs").style.display = "flex";
          infoContainer.querySelector("h2").textContent = departamento;

          // Disparar evento personalizado para que tabs.js actualice las pestañas
          const event = new CustomEvent("departamentoSeleccionado", { detail: { departamento } });
          document.dispatchEvent(event);
        });
      }
    }).addTo(map);

    map.fitBounds(geoJsonLayer.getBounds());
  });

// Bloquear zoom de página con Ctrl
window.addEventListener('wheel', function(e) {
    if (e.ctrlKey) e.preventDefault();
}, { passive: false });

window.addEventListener('keydown', function(e) {
    if (e.ctrlKey && ['+', '-', '=', '0'].includes(e.key)) e.preventDefault();
});
