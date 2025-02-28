export async function renderAppSelectionScreen(container, state, onNext) {
  // Clear the container
  container.innerHTML = '';
  
  // Create screen element
  const screen = document.createElement('div');
  screen.className = 'screen';
  
  // Create title
  const title = document.createElement('h1');
  title.textContent = 'Selección de Acoplamiento - Paso 1';
  
  // Create subtitle
  const subtitle = document.createElement('p');
  subtitle.className = 'subtitle';
  subtitle.textContent = 'Elija un tipo de aplicación O ingrese el factor de servicio directamente';
  
  // Create application selection section
  const appSection = document.createElement('div');
  appSection.className = 'selection-section';
  
  const appSectionTitle = document.createElement('h2');
  appSectionTitle.textContent = 'Opción 1: Seleccionar Tipo de Aplicación';
  
  // Cargar datos de aplicaciones desde el archivo JSON
  let applications = [];
  
  try {
    // Get the base path for the current environment
    const basePath = location.pathname.includes('/Fundal-PWA') 
      ? '/Fundal-PWA' 
      : '';
    
    const filePath = `${basePath}/data/service_factors.json`;
    const response = await fetch(filePath);
    
    if (!response.ok) {
      throw new Error(`Error loading applications: ${response.status} ${response.statusText}`);
    }
    const data = await response.json();
    applications = data.applications;
  } catch (error) {
    console.error('Error loading service factors data:', error);
    // Usar datos predeterminados en caso de error
    applications = [
      { id: '', name: 'Seleccione una aplicación...', defaultServiceFactor: '' },
      { id: 'pump', name: 'Bombas', defaultServiceFactor: 1.5 },
      { id: 'fan', name: 'Ventiladores & Sopladores', defaultServiceFactor: 1.4 },
      { id: 'compressor', name: 'Compresores', defaultServiceFactor: 1.8 },
      { id: 'mixer', name: 'Mezcladores & Agitadores', defaultServiceFactor: 2.0 },
      { id: 'conveyor', name: 'Transportadores', defaultServiceFactor: 1.7 },
      { id: 'crusher', name: 'Trituradoras & Molinos', defaultServiceFactor: 2.2 },
      { id: 'generator', name: 'Generadores', defaultServiceFactor: 1.3 }
    ];
  }
  
  // Crear selectores para aplicación y subcategoría
  const appSelectContainer = document.createElement('div');
  
  const appLabel = document.createElement('label');
  appLabel.htmlFor = 'application';
  appLabel.textContent = 'Tipo de Aplicación:';
  
  const appSelect = document.createElement('select');
  appSelect.id = 'application';
  appSelect.name = 'application';
  
  // Añadir opción predeterminada
  const defaultOption = document.createElement('option');
  defaultOption.value = '';
  defaultOption.textContent = 'Seleccione una aplicación...';
  appSelect.appendChild(defaultOption);
  
  // Contenedor para subcategorías
  const subcategoryContainer = document.createElement('div');
  subcategoryContainer.className = 'subcategory-container';
  subcategoryContainer.style.marginTop = '15px';
  subcategoryContainer.style.display = 'none';
  
  const subcategoryLabel = document.createElement('label');
  subcategoryLabel.htmlFor = 'subcategory';
  subcategoryLabel.textContent = 'Subcategoría:';
  
  const subcategorySelect = document.createElement('select');
  subcategorySelect.id = 'subcategory';
  subcategorySelect.name = 'subcategory';
  
  // Add options to main select
  applications.forEach(app => {
    if (app.id) {  // Skip empty entries
      const option = document.createElement('option');
      option.value = app.id;
      option.textContent = app.name;
      option.dataset.factor = app.defaultServiceFactor;
      option.dataset.description = app.description || '';
      appSelect.appendChild(option);
    }
  });
  
  // Set selected value if already in state
  if (state.selectedApplication) {
    appSelect.value = state.selectedApplication;
    
    // Mostrar subcategorías si hay una aplicación seleccionada
    const selectedApp = applications.find(app => app.id === state.selectedApplication);
    if (selectedApp && selectedApp.categories && selectedApp.categories.length > 0) {
      updateSubcategories(selectedApp);
      subcategoryContainer.style.display = 'block';
    }
  }
  
  // Función para actualizar las subcategorías
  function updateSubcategories(application) {
    // Limpiar opciones actuales
    subcategorySelect.innerHTML = '';
    
    // Añadir opción predeterminada
    const defaultSubOption = document.createElement('option');
    defaultSubOption.value = '';
    defaultSubOption.textContent = `Seleccionar (Valor predeterminado: ${application.defaultServiceFactor})`;
    defaultSubOption.dataset.factor = application.defaultServiceFactor;
    subcategorySelect.appendChild(defaultSubOption);
    
    // Añadir subcategorías
    if (application.categories && application.categories.length > 0) {
      application.categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category.name;
        option.textContent = `${category.name} (Factor: ${category.serviceFactor})`;
        option.dataset.factor = category.serviceFactor;
        subcategorySelect.appendChild(option);
      });
    }
  }
  
  // Or divider
  const orDivider = document.createElement('div');
  orDivider.className = 'divider';
  
  const orText = document.createElement('span');
  orText.textContent = 'O';
  orDivider.appendChild(orText);
  
  // Create service factor section
  const sfSection = document.createElement('div');
  sfSection.className = 'selection-section';
  
  const sfSectionTitle = document.createElement('h2');
  sfSectionTitle.textContent = 'Opción 2: Ingresar Factor de Servicio Directamente';
  
  const sfLabel = document.createElement('label');
  sfLabel.htmlFor = 'serviceFactor';
  sfLabel.textContent = 'Factor de Servicio:';
  
  const sfInput = document.createElement('input');
  sfInput.type = 'number';
  sfInput.id = 'serviceFactor';
  sfInput.name = 'serviceFactor';
  sfInput.placeholder = 'Ingrese factor de servicio (ej. 1.5)';
  sfInput.min = '1.0';
  sfInput.step = '0.1';
  sfInput.value = state.serviceFactor;
  
  // Service factor help text
  const sfHelp = document.createElement('p');
  sfHelp.className = 'help-text';
  sfHelp.textContent = 'El factor de servicio considera variaciones de carga, típicamente entre 1.0-2.5';
  
  // Application description section
  const appDescriptionContainer = document.createElement('div');
  appDescriptionContainer.style.marginTop = '10px';
  appDescriptionContainer.style.display = 'none';
  
  const appDescription = document.createElement('p');
  appDescription.className = 'description-text';
  appDescription.style.fontStyle = 'italic';
  appDescription.style.padding = '10px';
  appDescription.style.backgroundColor = '#f8f8f8';
  appDescription.style.borderRadius = '4px';
  appDescription.style.borderLeft = '3px solid #4CAF50';
  
  appDescriptionContainer.appendChild(appDescription);
  
  // Create next button
  const nextButton = document.createElement('button');
  nextButton.textContent = 'Siguiente';
  nextButton.disabled = (!state.selectedApplication && !state.serviceFactor);
  
  // Add event listeners
  appSelect.addEventListener('change', () => {
    const selectedOption = appSelect.options[appSelect.selectedIndex];
    state.selectedApplication = appSelect.value;
    
    if (state.selectedApplication) {
      // Find the selected application
      const selectedApp = applications.find(app => app.id === state.selectedApplication);
      
      // Show/hide subcategories if available
      if (selectedApp && selectedApp.categories && selectedApp.categories.length > 0) {
        updateSubcategories(selectedApp);
        subcategoryContainer.style.display = 'block';
        
        // Use default service factor initially
        state.serviceFactor = selectedApp.defaultServiceFactor;
        sfInput.value = selectedApp.defaultServiceFactor;
      } else {
        subcategoryContainer.style.display = 'none';
        
        // Use service factor from main selection
        const factor = selectedOption.dataset.factor;
        state.serviceFactor = factor;
        sfInput.value = factor;
      }
      
      // Show application description if available
      if (selectedApp && selectedApp.description) {
        appDescription.textContent = selectedApp.description;
        appDescriptionContainer.style.display = 'block';
      } else {
        appDescriptionContainer.style.display = 'none';
      }
      
      // Disable direct service factor input
      sfInput.disabled = true;
    } else {
      sfInput.disabled = false;
      subcategoryContainer.style.display = 'none';
      appDescriptionContainer.style.display = 'none';
    }
    
    nextButton.disabled = (!state.selectedApplication && !state.serviceFactor);
  });
  
  // Add subcategory event listener
  subcategorySelect.addEventListener('change', () => {
    const selectedOption = subcategorySelect.options[subcategorySelect.selectedIndex];
    
    if (selectedOption.value) {
      // Update service factor based on subcategory
      const factor = selectedOption.dataset.factor;
      state.serviceFactor = factor;
      sfInput.value = factor;
    } else {
      // Use default service factor from parent application
      const selectedApp = applications.find(app => app.id === state.selectedApplication);
      if (selectedApp) {
        state.serviceFactor = selectedApp.defaultServiceFactor;
        sfInput.value = selectedApp.defaultServiceFactor;
      }
    }
  });
  
  sfInput.addEventListener('input', () => {
    state.serviceFactor = sfInput.value;
    
    if (sfInput.value) {
      // Clear application selection when user enters service factor directly
      state.selectedApplication = '';
      appSelect.value = '';
      subcategoryContainer.style.display = 'none';
      appDescriptionContainer.style.display = 'none';
    }
    
    nextButton.disabled = (!state.selectedApplication && !state.serviceFactor);
  });
  
  nextButton.addEventListener('click', () => {
    if (state.selectedApplication || state.serviceFactor) {
      onNext();
    }
  });
  
  // Append elements to sections
  appSection.appendChild(appSectionTitle);
  appSection.appendChild(appLabel);
  appSection.appendChild(appSelect);
  
  // Append subcategory selector
  subcategoryContainer.appendChild(subcategoryLabel);
  subcategoryContainer.appendChild(subcategorySelect);
  appSection.appendChild(subcategoryContainer);
  
  // Append application description
  appSection.appendChild(appDescriptionContainer);
  
  // Append service factor section
  sfSection.appendChild(sfSectionTitle);
  sfSection.appendChild(sfLabel);
  sfSection.appendChild(sfInput);
  sfSection.appendChild(sfHelp);
  
  // Append elements to screen
  screen.appendChild(title);
  screen.appendChild(subtitle);
  screen.appendChild(appSection);
  screen.appendChild(orDivider);
  screen.appendChild(sfSection);
  screen.appendChild(nextButton);
  
  // Append screen to container
  container.appendChild(screen);
}