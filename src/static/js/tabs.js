// tabs.js
let currentDepartamento = null;

function initTabs() {
  const tabsContainer = document.querySelector(".info_tabs");
  const tabContent = document.getElementById("tab_content");

  // Delegación de eventos: un solo listener para todo el contenedor de pestañas
  tabsContainer.addEventListener("click", (event) => {
    const clickedButton = event.target.closest(".tab_button");
    if (!clickedButton) return;

    // Quitar clase 'active' de todos los botones y activar el clicado
    tabsContainer
      .querySelectorAll(".tab_button")
      .forEach((btn) => btn.classList.remove("active"));
    clickedButton.classList.add("active");

    const selectedTab = clickedButton.dataset.tab;

    // No hacer nada si no hay departamento seleccionado
    if (!currentDepartamento) return;

    // Mostrar contenido según la pestaña
    if (selectedTab === "antecedentes") {
      tabContent.innerHTML = `
        <h3>Antecedentes sísmicos</h3>
        <div id="loading_antecedentes">Cargando antecedentes...</div>
      `;

      fetch(`/api/antecedentes/${currentDepartamento}`)
        .then(res => res.json())
        .then(data => {
          if (data.error) {
            tabContent.innerHTML = `
                    <h3>Antecedentes sísmicos</h3>
                    <p class="error">${data.error}</p>
                `;
          } else {
            // Build the events table
            let eventosHTML = '';
            data.eventos_recientes.forEach(evento => {
              const magnitudClass = evento.magnitud >= 5.0 ? 'mag-high' : evento.magnitud >= 4.5 ? 'mag-medium' : 'mag-low';
              eventosHTML += `
                        <tr>
                            <td>${evento.fecha}</td>
                            <td class="${magnitudClass}">${evento.magnitud}</td>
                            <td>${evento.profundidad} km</td>
                            <td>${evento.latitud.toFixed(4)}, ${evento.longitud.toFixed(4)}</td>
                        </tr>
                    `;
            });

            tabContent.innerHTML = `
                    <h3>Antecedentes sísmicos de ${data.region}</h3>
                    <div class="antecedentes_card">
                        <h4>📅 Eventos Recientes (últimos 20)</h4>
                        <p class="info_text">Total de eventos registrados: <strong>${data.total_eventos}</strong></p>
                        <div class="events_table_container">
                            <table class="events_table">
                                <thead>
                                    <tr>
                                        <th>Fecha y Hora</th>
                                        <th>Magnitud</th>
                                        <th>Profundidad</th>
                                        <th>Coordenadas</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${eventosHTML}
                                </tbody>
                            </table>
                        </div>
                        
                        <p class="date_range"><small>📆 Rango de datos: ${data.fecha_mas_antigua} a ${data.fecha_mas_reciente}</small></p>
                    </div>
                `;
          }
        })
        .catch(err => {
          tabContent.innerHTML = `
                <h3>Antecedentes sísmicos</h3>
                <p class="error">Error al cargar los datos.</p>
            `;
          console.error(err);
        });
    } else if (selectedTab === "pronostico") {
      tabContent.innerHTML = `
        <h3>Pronóstico sísmico</h3>
        <div id="loading_forecast">Cargando pronóstico...</div>
      `;

      fetch(`/api/pronostico/${currentDepartamento}`)
        .then(res => res.json())
        .then(data => {
          if (data.error) {
            tabContent.innerHTML = `
                    <h3>Pronóstico sísmico</h3>
                    <p class="error">${data.error}</p>
                `;
          } else {
            tabContent.innerHTML = `
                    <h3>Pronóstico sísmico para ${data.region}</h3>
                    <div class="forecast_card">
                        <h4>📅 Próximo Evento Estimado</h4>
                        <p><strong>Fecha Estimada:</strong> ${data.fecha_estimada}</p>
                        <p><strong>Hora Estimada:</strong> ${data.hora_estimada}</p>
                        <p><strong>Magnitud Probable:</strong> ${data.magnitud_estimada} Mw</p>
                        <p><strong>Profundidad Estimada:</strong> ${data.profundidad_estimada} km</p>
                        <p><strong>Nivel de Riesgo:</strong> <span class="risk_${data.probabilidad.toLowerCase()}">${data.probabilidad}</span></p>
                        <hr>
                        <h4>📊 Análisis Histórico</h4>
                        <p><strong>Total de eventos registrados:</strong> ${data.total_eventos_historicos}</p>
                        <p><strong>Intervalo promedio entre sismos:</strong> ${data.intervalo_promedio_dias} días</p>
                        <p><strong>Último sismo registrado:</strong> ${data.ultimo_sismo_registrado.fecha}</p>
                        <p><strong>Magnitud:</strong> ${data.ultimo_sismo_registrado.magnitud} Mw | <strong>Profundidad:</strong> ${data.ultimo_sismo_registrado.profundidad} km</p>
                        <hr>
                        <p class="disclaimer"><small>⚠️ Este pronóstico es una estimación basada en patrones históricos y no debe considerarse como una predicción exacta.</small></p>
                    </div>
                `;
          }
        })
        .catch(err => {
          tabContent.innerHTML = `
                <h3>Pronóstico sísmico</h3>
                <p class="error">Error al cargar los datos.</p>
            `;
          console.error(err);
        });
    } else if (selectedTab === "estadisticas") {
      tabContent.innerHTML = `
        <h3>Estadísticas</h3>
        <div id="loading_estadisticas">Cargando estadísticas...</div>
      `;

      fetch(`/api/antecedentes/${currentDepartamento}`)
        .then(res => res.json())
        .then(data => {
          if (data.error) {
            tabContent.innerHTML = `
                    <h3>Estadísticas</h3>
                    <p class="error">${data.error}</p>
                `;
          } else {
            tabContent.innerHTML = `
                    <h3>Estadísticas de ${data.region}</h3>
                    <div class="antecedentes_card">
                        <h4>📊 Estadísticas Generales</h4>
                        <div class="stats_grid">
                            <div class="stat_item">
                                <span class="stat_label">Total de eventos:</span>
                                <span class="stat_value">${data.total_eventos}</span>
                            </div>
                            <div class="stat_item">
                                <span class="stat_label">Magnitud máxima:</span>
                                <span class="stat_value mag-high">${data.magnitud_maxima} Mw</span>
                            </div>
                            <div class="stat_item">
                                <span class="stat_label">Magnitud promedio:</span>
                                <span class="stat_value">${data.magnitud_promedio} Mw</span>
                            </div>
                            <div class="stat_item">
                                <span class="stat_label">Profundidad promedio:</span>
                                <span class="stat_value">${data.profundidad_promedio} km</span>
                            </div>
                        </div>
                        
                        <h4>📈 Distribución por Magnitud</h4>
                        <div class="magnitude_distribution">
                            <div class="mag_bar">
                                <span>4.0 - 4.9:</span>
                                <div class="bar_container">
                                    <div class="bar bar_low" style="width: ${(data.distribucion_magnitudes['4.0-4.9'] / data.total_eventos * 100)}%"></div>
                                    <span class="bar_label">${data.distribucion_magnitudes['4.0-4.9']}</span>
                                </div>
                            </div>
                            <div class="mag_bar">
                                <span>5.0 - 5.9:</span>
                                <div class="bar_container">
                                    <div class="bar bar_medium" style="width: ${(data.distribucion_magnitudes['5.0-5.9'] / data.total_eventos * 100)}%"></div>
                                    <span class="bar_label">${data.distribucion_magnitudes['5.0-5.9']}</span>
                                </div>
                            </div>
                            <div class="mag_bar">
                                <span>6.0+:</span>
                                <div class="bar_container">
                                    <div class="bar bar_high" style="width: ${(data.distribucion_magnitudes['6.0+'] / data.total_eventos * 100)}%"></div>
                                    <span class="bar_label">${data.distribucion_magnitudes['6.0+']}</span>
                                </div>
                            </div>
                        </div>
                        
                        <p class="date_range"><small>📆 Rango de datos: ${data.fecha_mas_antigua} a ${data.fecha_mas_reciente}</small></p>
                    </div>
                `;
          }
        })
        .catch(err => {
          tabContent.innerHTML = `
                <h3>Estadísticas</h3>
                <p class="error">Error al cargar los datos.</p>
            `;
          console.error(err);
        });
    }
  });
}

// Escuchar evento disparado por map.js cuando se selecciona un departamento
document.addEventListener("departamentoSeleccionado", (e) => {
  currentDepartamento = e.detail.departamento;

  // Activar la pestaña por defecto (ej. pronóstico)
  const infoContainer = document.getElementById("info_container");
  const defaultTab = infoContainer.querySelector(
    ".tab_button[data-tab='pronostico']"
  );
  if (defaultTab) defaultTab.click();
});

// Inicializar pestañas al cargar la página
document.addEventListener("DOMContentLoaded", () => {
  initTabs();
});
