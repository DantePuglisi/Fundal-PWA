// Datos de acoplamientos simulados (sin factor de servicio estático)
const acoplamientos = [
  { tamaño: 'F.A. 5', capacidad: 200 },
  { tamaño: 'F.A. 6', capacidad: 300 },
  { tamaño: 'F.A. 7', capacidad: 400 }
];

// Guardar historial
let historial = [];

// Calcular torque y sugerir acoplamientos
function calcularTorque() {
  const tipoPotencia = document.getElementById('power-type').value;
  const potencia = parseFloat(document.getElementById('power').value);
  const rpm = parseFloat(document.getElementById('rpm').value);
  const relacionReductor = parseFloat(document.getElementById('reducer-ratio').value);
  const resultadoTorque = document.getElementById('result');

  if (isNaN(potencia) || isNaN(rpm) || isNaN(relacionReductor) || potencia <= 0 || rpm <= 0 || relacionReductor <= 0) {
      resultadoTorque.innerHTML = "Por favor ingrese valores válidos.";
      return;
  }

  // Calcular torque
  let torque;
  if (tipoPotencia === 'hp') {
      torque = (7026 * potencia) / rpm;
  } else if (tipoPotencia === 'kw') {
      torque = (9550 * potencia) / rpm;
  }

  // Mostrar resultado de torque
  resultadoTorque.innerHTML = `<p>Torque Calculado: ${torque.toFixed(2)} Nm</p>`;

  // Sugerir acoplamientos basados en el rango de factor de servicio (1.2 a 3)
  const acoplamientosValidos = acoplamientos.filter(acoplamiento => {
      const factorServicio = acoplamiento.capacidad / torque;
      console.log(acoplamiento.tamaño)
      console.log(acoplamiento.capacidad)
      console.log(torque)
      console.log(factorServicio)
      return factorServicio >= 1.2 && factorServicio <= 3;
  });

  mostrarAcoplamientos(acoplamientosValidos, torque);
}

// Mostrar acoplamientos disponibles con factor de servicio calculado dinámicamente
function mostrarAcoplamientos(acoplamientos, torque) {
  const resultadosAcoplamientos = document.getElementById('coupling-results');
  resultadosAcoplamientos.innerHTML = '';

  if (acoplamientos.length === 0) {
      resultadosAcoplamientos.innerHTML = '<p>No se encontraron acoplamientos válidos para este torque.</p>';
      return;
  }

  const tabla = document.createElement('table');
  tabla.innerHTML = `
      <thead>
          <tr>
              <th>Tamaño del Acoplamiento</th>
              <th>Capacidad (Nm)</th>
              <th>Factor de Servicio</th>
              <th>Seleccionar</th>
          </tr>
      </thead>
      <tbody>
      </tbody>
  `;
  const tbody = tabla.querySelector('tbody');

  acoplamientos.forEach(acoplamiento => {
      const factorServicio = (acoplamiento.capacidad / torque).toFixed(2);

      const fila = document.createElement('tr');
      fila.innerHTML = `
          <td>${acoplamiento.tamaño}</td>
          <td>${acoplamiento.capacidad}</td>
          <td>${factorServicio}</td>
          <td><button onclick="seleccionarAcoplamiento('${acoplamiento.tamaño}', ${factorServicio})">Seleccionar</button></td>
      `;
      tbody.appendChild(fila);
  });

  resultadosAcoplamientos.appendChild(tabla);
}

// Seleccionar acoplamiento y mostrar especificaciones
function seleccionarAcoplamiento(tamaño, factorServicio) {
  const especificaciones = document.getElementById('specifications');
  especificaciones.innerHTML = `
      <h3>Acoplamiento Seleccionado: ${tamaño}</h3>
      <p>Factor de Servicio: ${factorServicio}</p>
      <p>Especificaciones: Especificaciones detalladas para el acoplamiento ${tamaño}.</p>
  `;

  // Guardar en historial
  guardarEnHistorial(tamaño, factorServicio);
}

// Guardar selección en historial
function guardarEnHistorial(tamaño, factorServicio) {
  historial.push({ tamaño, factorServicio, fecha: new Date().toLocaleString() });
  actualizarHistorial();
}

// Mostrar historial
function actualizarHistorial() {
  const historialDiv = document.getElementById('history');
  historialDiv.innerHTML = '';

  if (historial.length === 0) {
      historialDiv.innerHTML = '<p>No hay historial disponible.</p>';
      return;
  }

  historial.forEach(entry => {
      historialDiv.innerHTML += `<p>${entry.fecha} - Tamaño del Acoplamiento: ${entry.tamaño}, Factor de Servicio: ${entry.factorServicio}</p>`;
  });
}

// Registrar el Service Worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
      navigator.serviceWorker.register('/Fundal-PWA/sw.js')
          .then((registration) => {
              console.log('Service Worker registrado con éxito:', registration);
          })
          .catch((error) => {
              console.log('Error al registrar el Service Worker:', error);
          });
  });
}
