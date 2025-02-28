/**
 * Calcula el torque requerido basado en los parámetros del usuario
 * @param {number} powerValue - Valor de potencia ingresado por el usuario
 * @param {string} powerUnit - Unidad de potencia (hp o kw)
 * @param {number} rpm - Revoluciones por minuto
 * @param {number} serviceFactor - Factor de servicio
 * @returns {number} Torque requerido en Nm
 */
export function calculateRequiredTorque(powerValue, powerUnit, rpm, serviceFactor) {
  // Fórmula: ((factor * potencia) / rpm) * serviceFactor
  // Para HP: factor = 7026
  // Para kW: factor = 9550
  const factor = powerUnit === 'hp' ? 7026 : 9550;
  
  // Calcular el torque en Nm
  const torque = ((factor * parseFloat(powerValue)) / parseFloat(rpm)) * parseFloat(serviceFactor);
  
  return torque;
}

/**
 * Busca acoplamientos que cumplan con los requisitos
 * @param {number} requiredTorque - Torque requerido en Nm
 * @param {number} rpm - Revoluciones por minuto
 * @param {number} engineShaftSize - Tamaño del eje del motor en mm
 * @param {number} machineShaftSize - Tamaño del eje de la máquina en mm
 * @param {Array} couplings - Lista de acoplamientos disponibles
 * @param {string} applicationType - Tipo de aplicación seleccionada (opcional)
 * @returns {Array} Lista de acoplamientos recomendados
 */
export function findSuitableCouplings(requiredTorque, rpm, engineShaftSize, machineShaftSize, couplings) {
  let bestMatch = null;
  let bestScore = Infinity;
  
  // Ensure params are numbers (they should already be coming in as numbers, but just to be safe)
  const engineShaftSizeNum = Number(engineShaftSize);
  const machineShaftSizeNum = Number(machineShaftSize);
  const rpmNum = Number(rpm);
  const requiredTorqueNum = Number(requiredTorque);
  
  // Validate inputs
  if (isNaN(engineShaftSizeNum) || isNaN(machineShaftSizeNum) || isNaN(rpmNum) || isNaN(requiredTorqueNum)) {
    console.error('Invalid numeric inputs:', { requiredTorque, rpm, engineShaftSize, machineShaftSize });
    return [];
  }
  
  console.log('Searching couplings with params:', {
    requiredTorque: requiredTorqueNum,
    rpm: rpmNum,
    engineShaftSize: engineShaftSizeNum,
    machineShaftSize: machineShaftSizeNum
  });
  
  // Recorrer todos los acoplamientos
  couplings.forEach(coupling => {
    // Buscar tamaños que cumplan con los requisitos
    coupling.sizes.forEach(size => {
      // Verificar si el torque es suficiente (sin margen de seguridad adicional)
      // NOTA: En el futuro podría agregarse un margen de seguridad adicional, por ejemplo:
      // const additionalSafetyFactor = 1.0; // Cambiar a un valor mayor para agregar margen (ej: 1.1 para 10% adicional)
      // const torqueWithSafety = requiredTorqueNum * additionalSafetyFactor;
      
      if (size.torque < requiredTorqueNum) {
        console.log(`${coupling.model} ${size.size} rejected: torque ${size.torque} < required ${requiredTorqueNum}`);
        return; // Continuar con el siguiente tamaño
      }
      
      // Verificar que la velocidad máxima sea adecuada
      if (size.maxRPM < rpmNum) {
        console.log(`${coupling.model} ${size.size} rejected: RPM ${size.maxRPM} < required ${rpmNum}`);
        return; // Continuar con el siguiente tamaño
      }
      
      console.log(`${coupling.model} ${size.size} passed torque & RPM checks:`, {
        torque: size.torque,
        requiredTorque: requiredTorqueNum,
        maxRPM: size.maxRPM,
        requiredRPM: rpmNum
      });
      
      // Verificar tamaños de ejes
      const conventionalMaxSize = size.shaftSizes.masaConvencional;
      const hasTaperSize = 'masaLlena' in size.shaftSizes;
      
      // Verificar si los ejes caben usando masa convencional
      const engineFitsConventional = engineShaftSizeNum <= conventionalMaxSize;
      const machineFitsConventional = machineShaftSizeNum <= conventionalMaxSize;
      
      let engineFitsTaper = false;
      let machineFitsTaper = false;
      
      // Para modelos con masaLlena, verificar también esa opción
      if (hasTaperSize) {
        const taperMaxSize = size.shaftSizes.masaLlena;
        engineFitsTaper = engineShaftSizeNum <= taperMaxSize;
        machineFitsTaper = machineShaftSizeNum <= taperMaxSize;
      }
      
      // Determinar si este tamaño es adecuado para el acoplamiento
      let isCompatible = false;
      let configuration = null;
      
      // Depurar los valores de los tamaños de ejes para FA 6 específicamente (nuestro caso de prueba)
      if (coupling.model === 'FA' && size.size === 'FA 6') {
        console.log('FA 6 shaft size check:', {
          engineShaft: engineShaftSizeNum,
          machineShaft: machineShaftSizeNum,
          conventionalMaxSize: conventionalMaxSize,
          hasTaperSize: hasTaperSize,
          taperMaxSize: hasTaperSize ? size.shaftSizes.masaLlena : 'N/A',
          engineFitsConventional: engineShaftSizeNum <= conventionalMaxSize,
          machineFitsConventional: machineShaftSizeNum <= conventionalMaxSize,
          engineFitsTaper: hasTaperSize ? engineShaftSizeNum <= size.shaftSizes.masaLlena : false,
          machineFitsTaper: hasTaperSize ? machineShaftSizeNum <= size.shaftSizes.masaLlena : false
        });
      }
      
      if (hasTaperSize) {
        console.log(`${coupling.model} ${size.size} checking configuration:`, { 
          engineShaft: engineShaftSizeNum, 
          machineShaft: machineShaftSizeNum,
          conventionalMaxSize: conventionalMaxSize,
          taperMaxSize: size.shaftSizes.masaLlena
        });
        
        // Para FA, determinar la configuración específica basada en los tamaños exactos de los ejes
        if (engineShaftSizeNum <= conventionalMaxSize && machineShaftSizeNum <= conventionalMaxSize) {
          // Si ambos ejes caben en masa convencional, usar esa configuración
          isCompatible = true;
          configuration = "ambos_convencional";
          console.log(`${coupling.model} ${size.size}: ambos_convencional`);
        } else if (engineShaftSizeNum > conventionalMaxSize && machineShaftSizeNum > conventionalMaxSize) {
          // Si ninguno cabe en convencional pero ambos caben en llena
          if (engineShaftSizeNum <= size.shaftSizes.masaLlena && machineShaftSizeNum <= size.shaftSizes.masaLlena) {
            isCompatible = true;
            configuration = "ambos_llena";
            console.log(`${coupling.model} ${size.size}: ambos_llena`);
          } else {
            console.log(`${coupling.model} ${size.size} rejected: both shafts too large even for taper`);
          }
        } else if (engineShaftSizeNum <= conventionalMaxSize && machineShaftSizeNum > conventionalMaxSize) {
          // Si motor cabe en convencional pero máquina necesita llena
          if (machineShaftSizeNum <= size.shaftSizes.masaLlena) {
            isCompatible = true;
            configuration = "motor_convencional_maquina_llena";
            console.log(`${coupling.model} ${size.size}: motor_convencional_maquina_llena`);
          } else {
            console.log(`${coupling.model} ${size.size} rejected: machine shaft too large for taper`);
          }
        } else if (engineShaftSizeNum > conventionalMaxSize && machineShaftSizeNum <= conventionalMaxSize) {
          // Si motor necesita llena pero máquina cabe en convencional
          if (engineShaftSizeNum <= size.shaftSizes.masaLlena) {
            isCompatible = true;
            configuration = "motor_llena_maquina_convencional";
            console.log(`${coupling.model} ${size.size}: motor_llena_maquina_convencional`);
          } else {
            console.log(`${coupling.model} ${size.size} rejected: engine shaft too large for taper`);
          }
        }
      } else {
        // Para FAS, solo verificar si ambos ejes caben en masa convencional
        isCompatible = engineShaftSizeNum <= conventionalMaxSize && machineShaftSizeNum <= conventionalMaxSize;
        configuration = "unico";
        
        if (isCompatible) {
          console.log(`${coupling.model} ${size.size}: unico (FAS compatible)`);
        } else {
          console.log(`${coupling.model} ${size.size} rejected: shafts too large for FAS`);
        }
      }
      
      // Si es compatible, calcular la puntuación para determinar el mejor ajuste
      if (isCompatible) {
        // =========== SISTEMA DE PUNTUACIÓN ===========
        // Menor puntuación = mejor acoplamiento
        
        // PUNTUACIÓN DE TORQUE: Puntuación basada en qué tan cerca está del torque requerido
        // Un acoplamiento con torque apenas por encima del requerido es ideal
        const torqueExcessRatio = (size.torque - requiredTorqueNum) / requiredTorqueNum;
        // Aplicar una función que penaliza más los excesos grandes
        const torqueScore = torqueExcessRatio;
        
        // PUNTUACIÓN DE RPM: Qué tan cerca está del RPM requerido
        // El RPM máximo del acoplamiento debe ser mayor al requerido, pero cuanto más cerca, mejor
        const rpmScore = Math.abs(size.maxRPM - rpmNum) / rpmNum;
        
        // PUNTUACIÓN TOTAL: Balance de ambos factores
        // Priorizamos seleccionar el acoplamiento con el torque más cercano por encima del requerido
        
        // NOTA: Puedes ajustar estos pesos según la importancia relativa:
        // - Mayor peso al torque = preferirá acoplamientos con torque apenas suficiente
        // - Mayor peso al RPM = preferirá acoplamientos con RPM máximo más cercano al requerido
        const weightTorque = 0.9; // 90% importancia al torque
        const weightRPM = 0.1;   // 10% importancia al RPM
        
        const totalScore = torqueScore * weightTorque + rpmScore * weightRPM;
        
        console.log(`${coupling.model} ${size.size} score:`, {
          torque: size.torque,
          requiredTorque: requiredTorqueNum,
          torqueExcess: size.torque - requiredTorqueNum,
          torqueScore: torqueScore.toFixed(3),
          rpmScore: rpmScore.toFixed(3),
          totalScore: totalScore.toFixed(3)
        });
        
        // Si este tamaño tiene mejor puntuación que el mejor hasta ahora, actualizar
        if (totalScore < bestScore) {
          bestScore = totalScore;
          bestMatch = {
            model: coupling.model,
            type: coupling.type,
            description: coupling.description,
            features: coupling.features,
            suitableSizes: [size],
            configuration: configuration
          };
        }
      }
    });
  });
  
  console.log('Best match found:', bestMatch);
  
  // Si encontramos un acoplamiento adecuado, devolverlo como un array con un solo elemento
  // Si no encontramos ninguno, devolver un array vacío
  return bestMatch ? [bestMatch] : [];
}

/**
 * Determina el tipo de masa a utilizar (convencional o llena)
 * @param {number} engineShaftSize - Tamaño del eje del motor en mm
 * @param {number} machineShaftSize - Tamaño del eje de la máquina en mm
 * @param {Object} sizeData - Datos del tamaño del acoplamiento
 * @returns {string} Tipo de masa recomendada ('masaConvencional' o 'masaLlena')
 */
export function determineShaftMassType(engineShaftSize, machineShaftSize, sizeData) {
  const engineShaftSizeNum = parseFloat(engineShaftSize);
  const machineShaftSizeNum = parseFloat(machineShaftSize);
  
  const maxShaftSize = Math.max(engineShaftSizeNum, machineShaftSizeNum);
  
  // Si el modelo no tiene masaLlena (como FAS), siempre retornar masaConvencional
  if (!('masaLlena' in sizeData.shaftSizes)) {
    return 'masaConvencional';
  }
  
  // Si el eje más grande cabe en el tamaño convencional, usar ese
  if (maxShaftSize <= sizeData.shaftSizes.masaConvencional) {
    return 'masaConvencional';
  } else {
    return 'masaLlena';
  }
}