import { calculateRequiredTorque, findSuitableCouplings, determineShaftMassType } from '../utils/couplingCalculator.js';

export async function renderResultsScreen(container, state, onBack) {
  // Clear the container
  container.innerHTML = '';
  
  // Create screen element
  const screen = document.createElement('div');
  screen.className = 'screen';
  
  // Create title
  const title = document.createElement('h1');
  title.textContent = 'Selección de Acoplamiento - Resultado';
  
  // Create subtitle
  const subtitle = document.createElement('p');
  subtitle.className = 'subtitle';
  subtitle.textContent = 'Basado en sus parámetros de entrada';
  
  // Create input summary section
  const summarySection = document.createElement('div');
  summarySection.className = 'selection-section';
  
  const summaryTitle = document.createElement('h2');
  summaryTitle.textContent = 'Resumen de Entrada';
  
  // Input parameters display
  const inputParams = document.createElement('div');
  inputParams.className = 'results';
  
  // Application type or service factor
  const appOrSFDisplay = document.createElement('div');
  appOrSFDisplay.className = 'form-group';
  
  if (state.selectedApplication) {
    const appTypeLabel = document.createElement('h3');
    appTypeLabel.textContent = 'Tipo de Aplicación:';
    
    const appType = document.createElement('p');
    appType.className = 'result-value';
    const appMap = {
      'pump': 'Bombas',
      'fan': 'Ventiladores & Sopladores',
      'compressor': 'Compresores',
      'mixer': 'Mezcladores & Agitadores',
      'conveyor': 'Transportadores',
      'crusher': 'Trituradoras & Molinos',
      'generator': 'Generadores'
    };
    appType.textContent = appMap[state.selectedApplication] || 'Desconocido';
    
    appOrSFDisplay.appendChild(appTypeLabel);
    appOrSFDisplay.appendChild(appType);
  }
  
  // Service factor display (always shown)
  const sfDisplay = document.createElement('div');
  sfDisplay.className = 'form-group';
  
  const sfLabel = document.createElement('h3');
  sfLabel.textContent = 'Factor de Servicio:';
  
  const sfValue = document.createElement('p');
  sfValue.className = 'result-value';
  sfValue.textContent = state.serviceFactor;
  
  sfDisplay.appendChild(sfLabel);
  sfDisplay.appendChild(sfValue);
  
  // Power display
  const powerDisplay = document.createElement('div');
  powerDisplay.className = 'form-group';
  
  const powerLabel = document.createElement('h3');
  powerLabel.textContent = 'Potencia:';
  
  const powerValue = document.createElement('p');
  powerValue.className = 'result-value';
  powerValue.textContent = `${state.powerValue} ${state.powerUnit.toUpperCase()}`;
  
  powerDisplay.appendChild(powerLabel);
  powerDisplay.appendChild(powerValue);
  
  // Shaft sizes display
  const shaftsDisplay = document.createElement('div');
  shaftsDisplay.className = 'form-group';
  
  const shaftsLabel = document.createElement('h3');
  shaftsLabel.textContent = 'Tamaño de Ejes:';
  
  const engineShaftValue = document.createElement('p');
  engineShaftValue.className = 'result-value';
  engineShaftValue.textContent = `Motor: ${state.engineShaftSize} mm`;
  
  const machineShaftValue = document.createElement('p');
  machineShaftValue.className = 'result-value';
  machineShaftValue.textContent = `Máquina: ${state.machineShaftSize} mm`;
  
  shaftsDisplay.appendChild(shaftsLabel);
  shaftsDisplay.appendChild(engineShaftValue);
  shaftsDisplay.appendChild(machineShaftValue);
  
  // RPM display
  const rpmDisplay = document.createElement('div');
  rpmDisplay.className = 'form-group';
  
  const rpmLabel = document.createElement('h3');
  rpmLabel.textContent = 'Velocidad:';
  
  const rpmValue = document.createElement('p');
  rpmValue.className = 'result-value';
  rpmValue.textContent = `${state.rpm} RPM`;
  
  rpmDisplay.appendChild(rpmLabel);
  rpmDisplay.appendChild(rpmValue);
  
  // Recommendation section
  const recommendationSection = document.createElement('div');
  recommendationSection.className = 'selection-section';
  
  const recommendationTitle = document.createElement('h2');
  recommendationTitle.textContent = 'Mejor Acoplamiento Recomendado';
  
  // Calculate required torque using the provided formula
  const requiredTorque = calculateRequiredTorque(
    state.powerValue,
    state.powerUnit,
    state.rpm,
    state.serviceFactor
  );
  
  // Debug calculated values
  console.log('Calculated required torque:', requiredTorque);
  console.log('Input parameters:', {
    powerValue: state.powerValue,
    powerUnit: state.powerUnit,
    rpm: state.rpm,
    serviceFactor: state.serviceFactor,
    engineShaftSize: state.engineShaftSize,
    machineShaftSize: state.machineShaftSize
  });
  
  // Load couplings data
  let couplings = [];
  let recommendedCouplings = [];
  
  try {
    const loadingMessage = document.createElement('p');
    loadingMessage.textContent = 'Calculando recomendaciones...';
    recommendationSection.appendChild(loadingMessage);
    
    // Get the base path for the current environment
    const basePath = location.pathname.includes('/Fundal-PWA') 
      ? '/Fundal-PWA' 
      : '';
    
    // Try to load the couplings file
    let response;
    const filePath = `${basePath}/data/couplings.json`;
    
    try {
      console.log(`Trying to load couplings from: ${filePath}`);
      response = await fetch(filePath);
      if (response.ok) {
        console.log(`Successfully loaded couplings from: ${filePath}`);
      }
    } catch (e) {
      console.log(`Failed to load from ${filePath}: ${e.message}`);
    }
    
    if (!response || !response.ok) {
      throw new Error(`Error loading couplings: Could not find file`);
    }
    
    const data = await response.json();
    couplings = data.couplings;
    
    console.log(`Loaded ${couplings.length} coupling models`);
    
    // Make sure state values are properly converted to numbers
    const params = {
      requiredTorque: parseFloat(requiredTorque),
      rpm: parseFloat(state.rpm),
      engineShaftSize: parseFloat(state.engineShaftSize),
      machineShaftSize: parseFloat(state.machineShaftSize)
    };
    
    // Find suitable couplings
    recommendedCouplings = findSuitableCouplings(
      params.requiredTorque,
      params.rpm,
      params.engineShaftSize,
      params.machineShaftSize,
      couplings
    );
    
    // Remove loading message
    recommendationSection.removeChild(loadingMessage);
  } catch (error) {
    console.error('Error loading couplings data:', error);
    recommendedCouplings = [];
  }
  
  // Create recommendation display
  const recommendedParams = document.createElement('div');
  recommendedParams.className = 'recommendation-details';
  
  // Show calculation results
  const calculationBox = document.createElement('div');
  calculationBox.style.marginBottom = '20px';
  calculationBox.style.padding = '15px';
  calculationBox.style.backgroundColor = '#f8f8f8';
  calculationBox.style.borderRadius = '5px';
  
  const torqueTitle = document.createElement('h3');
  torqueTitle.textContent = 'Cálculos Realizados:';
  
  const torqueFormula = document.createElement('p');
  torqueFormula.innerHTML = `<strong>Fórmula:</strong> ${state.powerUnit === 'hp' ? '7026' : '9550'} × Potencia ÷ RPM × Factor de Servicio`;
  
  const torqueCalc = document.createElement('p');
  torqueCalc.innerHTML = `<strong>Torque requerido:</strong> ${requiredTorque.toFixed(2)} Nm`;
  
  calculationBox.appendChild(torqueTitle);
  calculationBox.appendChild(torqueFormula);
  calculationBox.appendChild(torqueCalc);
  
  recommendedParams.appendChild(calculationBox);
  
  // Display recommended couplings or "no couplings found" message
  if (recommendedCouplings.length > 0) {
    const recommendationMessage = document.createElement('p');
    recommendationMessage.textContent = 'Basado en sus requisitos, recomendamos el siguiente acoplamiento que mejor se ajusta a sus necesidades:';
    recommendationMessage.style.marginBottom = '15px';
    recommendedParams.appendChild(recommendationMessage);
    
    // Create coupling cards
    recommendedCouplings.forEach(coupling => {
      const couplingCard = document.createElement('div');
      couplingCard.className = 'coupling-card';
      couplingCard.style.border = '1px solid #4CAF50';
      couplingCard.style.borderRadius = '5px';
      couplingCard.style.padding = '15px';
      couplingCard.style.backgroundColor = '#f5fff5';
      couplingCard.style.marginBottom = '15px';
      
      const couplingTitle = document.createElement('h3');
      couplingTitle.textContent = `${coupling.model} - ${coupling.type}`;
      couplingTitle.style.marginTop = '0';
      couplingTitle.style.borderBottom = '1px solid #ddd';
      couplingTitle.style.paddingBottom = '8px';
      
      const couplingDesc = document.createElement('p');
      couplingDesc.textContent = coupling.description;
      
      // Agregar explicación de por qué se eligió este acoplamiento
      const reasonBox = document.createElement('div');
      reasonBox.style.marginTop = '10px';
      reasonBox.style.padding = '10px';
      reasonBox.style.backgroundColor = '#e8f5e9';
      reasonBox.style.borderRadius = '4px';
      
      const reasonTitle = document.createElement('h4');
      reasonTitle.textContent = '¿Por qué se recomienda?';
      reasonTitle.style.marginTop = '0';
      reasonTitle.style.marginBottom = '8px';
      
      const reason = document.createElement('p');
      const size = coupling.suitableSizes[0];
      
      // Calcular porcentaje de exceso de torque (cuánto más tiene sobre lo requerido)
      const torqueExcess = Math.round((size.torque / requiredTorque - 1) * 100);
      
      // Generar texto explicativo
      let shaftText = '';
      
      // Verificar existencia de propiedades para evitar errores
      const hasTaperSize = size.shaftSizes && 'masaLlena' in size.shaftSizes;
      const convMaxSizeText = size.shaftSizes ? `${size.shaftSizes.masaConvencional}mm` : "N/A";
      const taperMaxSizeText = hasTaperSize ? `${size.shaftSizes.masaLlena}mm` : "N/A";
      
      // Texto específico según configuración recomendada
      const configuration = coupling.configuration || '';
      
      if (configuration === "ambos_convencional") {
        shaftText = `Ambos ejes (${state.engineShaftSize}mm y ${state.machineShaftSize}mm) caben dentro del límite de masa convencional (${convMaxSizeText})`;
      } else if (configuration === "ambos_llena") {
        shaftText = `Ambos ejes (${state.engineShaftSize}mm y ${state.machineShaftSize}mm) requieren masa llena (límite ${taperMaxSizeText})`;
      } else if (configuration === "motor_convencional_maquina_llena") {
        shaftText = `El eje del motor (${state.engineShaftSize}mm) cabe en masa convencional (límite ${convMaxSizeText})<br>• El eje de la máquina (${state.machineShaftSize}mm) requiere masa llena (límite ${taperMaxSizeText})`;
      } else if (configuration === "motor_llena_maquina_convencional") {
        shaftText = `El eje del motor (${state.engineShaftSize}mm) requiere masa llena (límite ${taperMaxSizeText})<br>• El eje de la máquina (${state.machineShaftSize}mm) cabe en masa convencional (límite ${convMaxSizeText})`;
      } else if (configuration === "unico") {
        // Para FAS, no mencionamos "masa" ya que solo tiene un tipo de acople
        shaftText = `Ambos ejes (${state.engineShaftSize}mm y ${state.machineShaftSize}mm) caben dentro del límite máximo (${convMaxSizeText})`;
      } else {
        // En caso de configuración desconocida
        shaftText = `Dimensiones de ejes (${state.engineShaftSize}mm y ${state.machineShaftSize}mm) compatibles con este acoplamiento`;
      }
      
      reason.innerHTML = `Este acoplamiento fue elegido porque:<br>
        • Soporta el torque requerido (${requiredTorque.toFixed(2)} Nm) con un margen del ${torqueExcess}%<br>
        • Funciona dentro del rango de RPM necesario (máx. ${size.maxRPM} RPM)<br>
        • ${shaftText}<br>
        • Es el diseño que mejor se ajusta a sus parámetros específicos`;
      
      reasonBox.appendChild(reasonTitle);
      reasonBox.appendChild(reason);
      couplingDesc.appendChild(reasonBox);
      
      // Create sizes list
      const sizesList = document.createElement('div');
      
      const sizesTitle = document.createElement('h4');
      sizesTitle.textContent = 'Tamaño recomendado:';
      sizesTitle.style.marginBottom = '8px';
      sizesList.appendChild(sizesTitle);
      
      coupling.suitableSizes.forEach(size => {
        const sizeItem = document.createElement('div');
        sizeItem.style.padding = '8px';
        sizeItem.style.margin = '5px 0';
        sizeItem.style.backgroundColor = '#e8f5e9';
        sizeItem.style.borderRadius = '4px';
        
        const sizeName = document.createElement('div');
        sizeName.style.fontWeight = 'bold';
        sizeName.textContent = size.size;
        
        const sizeSpecs = document.createElement('ul');
        sizeSpecs.style.marginTop = '5px';
        sizeSpecs.style.paddingLeft = '20px';
        
        const torqueSpec = document.createElement('li');
        torqueSpec.textContent = `Torque: ${size.torque} ${size.torqueUnit}`;
        
        const rpmSpec = document.createElement('li');
        rpmSpec.textContent = `RPM máximo: ${size.maxRPM}`;
        
        // Determine shaft mass type
        const massType = determineShaftMassType(
          state.engineShaftSize,
          state.machineShaftSize,
          size
        );
        
        // Obtener la configuración recomendada (con verificación de existencia)
        const configuration = coupling.configuration || '';
        
        // Agregar información de torque y RPM
        sizeSpecs.appendChild(torqueSpec);
        sizeSpecs.appendChild(rpmSpec);
        
        // Agregar información de tipo de masa solo para modelos FA (con masaLlena)
        if (size.shaftSizes && 'masaLlena' in size.shaftSizes) {
          const massTypeSpec = document.createElement('li');
          
          // Para modelos FA con configuración específica
          if (configuration === "ambos_convencional") {
            massTypeSpec.textContent = 'Configuración recomendada: Masa Convencional en ambos lados';
          } else if (configuration === "ambos_llena") {
            massTypeSpec.textContent = 'Configuración recomendada: Masa Llena en ambos lados';
          } else if (configuration === "motor_convencional_maquina_llena") {
            massTypeSpec.textContent = 'Configuración recomendada: Masa Convencional (lado motor) y Masa Llena (lado máquina)';
          } else if (configuration === "motor_llena_maquina_convencional") {
            massTypeSpec.textContent = 'Configuración recomendada: Masa Llena (lado motor) y Masa Convencional (lado máquina)';
          } else {
            // Fallback a la lógica anterior si no hay configuración específica
            massTypeSpec.textContent = `Tipo de masa recomendada: ${massType === 'masaConvencional' ? 'Masa Convencional' : 'Masa Llena'}`;
          }
          
          sizeSpecs.appendChild(massTypeSpec);
        }
        // Para modelos FAS (sin masaLlena), no mostramos información de tipo de masa
        
        sizeItem.appendChild(sizeName);
        sizeItem.appendChild(sizeSpecs);
        sizesList.appendChild(sizeItem);
      });
      
      // Features list
      const featuresList = document.createElement('div');
      featuresList.style.marginTop = '15px';
      
      const featuresTitle = document.createElement('h4');
      featuresTitle.textContent = 'Características:';
      featuresTitle.style.marginBottom = '8px';
      featuresList.appendChild(featuresTitle);
      
      const featureItems = document.createElement('ul');
      coupling.features.forEach(feature => {
        const featureItem = document.createElement('li');
        featureItem.textContent = feature;
        featureItems.appendChild(featureItem);
      });
      
      featuresList.appendChild(featureItems);
      
      // Add all elements to card
      couplingCard.appendChild(couplingTitle);
      couplingCard.appendChild(couplingDesc);
      couplingCard.appendChild(sizesList);
      couplingCard.appendChild(featuresList);
      
      recommendedParams.appendChild(couplingCard);
    });
  } else {
    // No couplings found message
    const noCouplingsMessage = document.createElement('div');
    noCouplingsMessage.style.padding = '15px';
    noCouplingsMessage.style.backgroundColor = '#fff0f0';
    noCouplingsMessage.style.border = '1px solid #ffcccc';
    noCouplingsMessage.style.borderRadius = '5px';
    
    const noCouplingsTitle = document.createElement('h3');
    noCouplingsTitle.textContent = 'No se encontraron acoplamientos compatibles';
    noCouplingsTitle.style.color = '#cc0000';
    
    const noCouplingsExplanation = document.createElement('p');
    noCouplingsExplanation.textContent = 'Ningún acoplamiento en nuestra base de datos cumple con todos los requisitos especificados. Considere ajustar los parámetros o contactar a nuestro equipo técnico para una solución personalizada.';
    
    noCouplingsMessage.appendChild(noCouplingsTitle);
    noCouplingsMessage.appendChild(noCouplingsExplanation);
    
    recommendedParams.appendChild(noCouplingsMessage);
  }
  
  // Input parameters summary
  const inputParamsBox = document.createElement('div');
  inputParamsBox.style.marginTop = '20px';
  inputParamsBox.style.padding = '15px';
  inputParamsBox.style.backgroundColor = '#f5f5f5';
  inputParamsBox.style.borderRadius = '5px';
  
  const inputParamsTitle = document.createElement('h3');
  inputParamsTitle.textContent = 'Parámetros de entrada:';
  
  const paramList = document.createElement('ul');
  paramList.style.listStyleType = 'none';
  paramList.style.padding = '10px 0';
  
  // Create list items for each parameter
  const powerParam = document.createElement('li');
  powerParam.textContent = `Potencia: ${state.powerValue} ${state.powerUnit.toUpperCase()}`;
  powerParam.style.padding = '5px 0';
  
  const sfParam = document.createElement('li');
  sfParam.textContent = `Factor de Servicio: ${state.serviceFactor}`;
  sfParam.style.padding = '5px 0';
  
  const shaftsParam = document.createElement('li');
  shaftsParam.textContent = `Tamaño de Ejes: ${state.engineShaftSize} mm (Motor) / ${state.machineShaftSize} mm (Máquina)`;
  shaftsParam.style.padding = '5px 0';
  
  const rpmParam = document.createElement('li');
  rpmParam.textContent = `Velocidad: ${state.rpm} RPM`;
  rpmParam.style.padding = '5px 0';
  
  // Append params to list
  paramList.appendChild(powerParam);
  paramList.appendChild(sfParam);
  paramList.appendChild(shaftsParam);
  paramList.appendChild(rpmParam);
  
  // Append list to box
  inputParamsBox.appendChild(inputParamsTitle);
  inputParamsBox.appendChild(paramList);
  
  recommendedParams.appendChild(inputParamsBox);
  
  // Create back button
  const backButton = document.createElement('button');
  backButton.textContent = 'Volver a Parámetros';
  backButton.addEventListener('click', onBack);
  
  // Create new calculation button
  const newButton = document.createElement('button');
  newButton.textContent = 'Nuevo Cálculo';
  newButton.style.marginLeft = '10px';
  newButton.addEventListener('click', () => {
    // Reset state and go back to first screen
    state.selectedApplication = '';
    state.powerValue = '';
    state.serviceFactor = '';
    state.engineShaftSize = '';
    state.machineShaftSize = '';
    state.rpm = '';
    window.location.reload(); // Simple way to restart the app
  });
  
  // Append elements to input summary section
  summarySection.appendChild(summaryTitle);
  
  if (state.selectedApplication) {
    inputParams.appendChild(appOrSFDisplay);
  }
  
  inputParams.appendChild(sfDisplay);
  inputParams.appendChild(powerDisplay);
  inputParams.appendChild(shaftsDisplay);
  inputParams.appendChild(rpmDisplay);
  
  summarySection.appendChild(inputParams);
  
  // Append elements to recommendation section
  recommendationSection.appendChild(recommendationTitle);
  recommendationSection.appendChild(recommendedParams);
  
  // Create button container
  const buttonContainer = document.createElement('div');
  buttonContainer.style.display = 'flex';
  buttonContainer.style.marginTop = '20px';
  
  buttonContainer.appendChild(backButton);
  buttonContainer.appendChild(newButton);
  
  // Append all sections to screen
  screen.appendChild(title);
  screen.appendChild(subtitle);
  screen.appendChild(summarySection);
  screen.appendChild(recommendationSection);
  screen.appendChild(buttonContainer);
  
  // Append screen to container
  container.appendChild(screen);
}