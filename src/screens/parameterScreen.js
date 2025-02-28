export function renderParameterScreen(container, state, onNext, onBack) {
  // Clear the container
  container.innerHTML = '';
  
  // Create screen element
  const screen = document.createElement('div');
  screen.className = 'screen';
  
  // Create title
  const title = document.createElement('h1');
  title.textContent = 'Selección de Acoplamiento - Paso 2';
  
  // Create subtitle
  const subtitle = document.createElement('p');
  subtitle.className = 'subtitle';
  subtitle.textContent = 'Ingrese las especificaciones del equipo';
  
  // Create form for parameters
  const form = document.createElement('form');
  form.onsubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onNext();
    }
  };
  
  // Power input section
  const powerSection = document.createElement('div');
  powerSection.className = 'form-group';
  
  const powerLabel = document.createElement('label');
  powerLabel.htmlFor = 'power';
  powerLabel.textContent = 'Potencia:';
  
  const powerInputGroup = document.createElement('div');
  powerInputGroup.style.display = 'flex';
  powerInputGroup.style.alignItems = 'center';
  
  const powerInput = document.createElement('input');
  powerInput.type = 'number';
  powerInput.id = 'power';
  powerInput.name = 'power';
  powerInput.placeholder = 'Ingrese el valor de potencia';
  powerInput.value = state.powerValue;
  powerInput.required = true;
  powerInput.min = '0';
  powerInput.step = 'any';
  powerInput.style.flexGrow = '1';
  powerInput.style.marginRight = '10px';
  
  // Radio buttons for power unit
  const radioGroup = document.createElement('div');
  radioGroup.className = 'radio-group';
  
  // HP option
  const hpOption = document.createElement('div');
  hpOption.className = 'radio-option';
  
  const hpRadio = document.createElement('input');
  hpRadio.type = 'radio';
  hpRadio.id = 'hp-unit';
  hpRadio.name = 'power-unit';
  hpRadio.value = 'hp';
  hpRadio.checked = state.powerUnit === 'hp';
  
  const hpRadioLabel = document.createElement('label');
  hpRadioLabel.htmlFor = 'hp-unit';
  hpRadioLabel.textContent = 'HP';
  
  hpOption.appendChild(hpRadio);
  hpOption.appendChild(hpRadioLabel);
  
  // kW option
  const kwOption = document.createElement('div');
  kwOption.className = 'radio-option';
  
  const kwRadio = document.createElement('input');
  kwRadio.type = 'radio';
  kwRadio.id = 'kw-unit';
  kwRadio.name = 'power-unit';
  kwRadio.value = 'kw';
  kwRadio.checked = state.powerUnit === 'kw';
  
  const kwRadioLabel = document.createElement('label');
  kwRadioLabel.htmlFor = 'kw-unit';
  kwRadioLabel.textContent = 'kW';
  
  kwOption.appendChild(kwRadio);
  kwOption.appendChild(kwRadioLabel);
  
  radioGroup.appendChild(hpOption);
  radioGroup.appendChild(kwOption);
  
  // Service factor display (from previous screen)
  const sfGroup = document.createElement('div');
  sfGroup.className = 'form-group';
  
  const sfLabel = document.createElement('label');
  sfLabel.textContent = 'Factor de Servicio:';
  
  const sfValue = document.createElement('p');
  sfValue.textContent = state.serviceFactor;
  sfValue.className = 'input-like';
  sfValue.style.padding = '10px';
  sfValue.style.border = '1px solid #ddd';
  sfValue.style.borderRadius = '5px';
  sfValue.style.backgroundColor = '#f9f9f9';

  const sfHelpContainer = document.createElement('div');
  sfHelpContainer.style.display = 'flex';
  sfHelpContainer.style.alignItems = 'center';
  sfHelpContainer.style.gap = '10px';
  
  const sfHelp = document.createElement('p');
  sfHelp.className = 'help-text';
  sfHelp.style.margin = '0';
  
  if (state.selectedApplication) {
    sfHelp.textContent = `Basado en la aplicación seleccionada: ${getApplicationName(state.selectedApplication)}`;
    
    // Add "Cambiar" button
    const changeButton = document.createElement('button');
    changeButton.textContent = 'Cambiar';
    changeButton.className = 'small-button';
    changeButton.style.fontSize = '12px';
    changeButton.style.padding = '3px 8px';
    changeButton.style.height = 'auto';
    
    changeButton.addEventListener('click', () => {
      state.selectedApplication = '';
      onBack(); // Go back to application selection screen
    });
    
    sfHelpContainer.appendChild(sfHelp);
    sfHelpContainer.appendChild(changeButton);
  } else {
    sfHelp.textContent = 'Ingresado manualmente';
    sfHelpContainer.appendChild(sfHelp);
  }
  
  // Engine shaft size field
  const engineShaftGroup = document.createElement('div');
  engineShaftGroup.className = 'form-group';
  
  const engineShaftLabel = document.createElement('label');
  engineShaftLabel.htmlFor = 'engineShaft';
  engineShaftLabel.textContent = 'Tamaño del Eje Motor (mm):';
  
  const engineShaftInput = document.createElement('input');
  engineShaftInput.type = 'number';
  engineShaftInput.id = 'engineShaft';
  engineShaftInput.name = 'engineShaft';
  engineShaftInput.placeholder = 'Ingrese el tamaño del eje motor en mm';
  engineShaftInput.value = state.engineShaftSize;
  engineShaftInput.required = true;
  engineShaftInput.min = '0';
  engineShaftInput.step = 'any';
  
  // Machine shaft size field
  const machineShaftGroup = document.createElement('div');
  machineShaftGroup.className = 'form-group';
  
  const machineShaftLabel = document.createElement('label');
  machineShaftLabel.htmlFor = 'machineShaft';
  machineShaftLabel.textContent = 'Tamaño del Eje Máquina (mm):';
  
  const machineShaftInput = document.createElement('input');
  machineShaftInput.type = 'number';
  machineShaftInput.id = 'machineShaft';
  machineShaftInput.name = 'machineShaft';
  machineShaftInput.placeholder = 'Ingrese el tamaño del eje máquina en mm';
  machineShaftInput.value = state.machineShaftSize;
  machineShaftInput.required = true;
  machineShaftInput.min = '0';
  machineShaftInput.step = 'any';
  
  // RPM field
  const rpmGroup = document.createElement('div');
  rpmGroup.className = 'form-group';
  
  const rpmLabel = document.createElement('label');
  rpmLabel.htmlFor = 'rpm';
  rpmLabel.textContent = 'RPM:';
  
  const rpmInput = document.createElement('input');
  rpmInput.type = 'number';
  rpmInput.id = 'rpm';
  rpmInput.name = 'rpm';
  rpmInput.placeholder = 'Ingrese RPM';
  rpmInput.value = state.rpm;
  rpmInput.required = true;
  rpmInput.min = '0';
  
  // Create buttons
  const buttonContainer = document.createElement('div');
  buttonContainer.style.display = 'flex';
  
  const backButton = document.createElement('button');
  backButton.type = 'button';
  backButton.textContent = 'Atrás';
  backButton.className = 'back-button';
  backButton.addEventListener('click', onBack);
  
  const nextButton = document.createElement('button');
  nextButton.type = 'submit';
  nextButton.textContent = 'Calcular';
  
  // Add event listeners to update state
  powerInput.addEventListener('input', () => {
    state.powerValue = powerInput.value;
  });
  
  hpRadio.addEventListener('change', () => {
    if (hpRadio.checked) {
      state.powerUnit = 'hp';
    }
  });
  
  kwRadio.addEventListener('change', () => {
    if (kwRadio.checked) {
      state.powerUnit = 'kw';
    }
  });
  
  engineShaftInput.addEventListener('input', () => {
    state.engineShaftSize = engineShaftInput.value;
  });
  
  machineShaftInput.addEventListener('input', () => {
    state.machineShaftSize = machineShaftInput.value;
  });
  
  rpmInput.addEventListener('input', () => {
    state.rpm = rpmInput.value;
  });
  
  // Helper function to get application name from value
  function getApplicationName(appValue) {
    const appMap = {
      'pump': 'Bombas',
      'fan': 'Ventiladores & Sopladores',
      'compressor': 'Compresores',
      'mixer': 'Mezcladores & Agitadores',
      'conveyor': 'Transportadores',
      'crusher': 'Trituradoras & Molinos',
      'generator': 'Generadores'
    };
    return appMap[appValue] || 'Desconocido';
  }
  
  // Function to validate form
  function validateForm() {
    return state.powerValue && 
           state.powerUnit &&
           state.engineShaftSize && 
           state.machineShaftSize && 
           state.rpm;
  }
  
  // Append elements to power section
  powerSection.appendChild(powerLabel);
  powerInputGroup.appendChild(powerInput);
  powerSection.appendChild(powerInputGroup);
  powerSection.appendChild(radioGroup);
  
  // Append service factor section
  sfGroup.appendChild(sfLabel);
  sfGroup.appendChild(sfValue);
  sfGroup.appendChild(sfHelpContainer);
  
  // Append shaft size and rpm sections
  engineShaftGroup.appendChild(engineShaftLabel);
  engineShaftGroup.appendChild(engineShaftInput);
  
  machineShaftGroup.appendChild(machineShaftLabel);
  machineShaftGroup.appendChild(machineShaftInput);
  
  rpmGroup.appendChild(rpmLabel);
  rpmGroup.appendChild(rpmInput);
  
  // Append elements to form
  form.appendChild(powerSection);
  form.appendChild(sfGroup);
  form.appendChild(engineShaftGroup);
  form.appendChild(machineShaftGroup);
  form.appendChild(rpmGroup);
  
  buttonContainer.appendChild(backButton);
  buttonContainer.appendChild(nextButton);
  form.appendChild(buttonContainer);
  
  // Append elements to screen
  screen.appendChild(title);
  screen.appendChild(subtitle);
  screen.appendChild(form);
  
  // Append screen to container
  container.appendChild(screen);
}