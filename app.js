// Function to calculate the sum
function calculateSum() {
  const num1 = parseFloat(document.getElementById('num1').value);
  const num2 = parseFloat(document.getElementById('num2').value);
  if (isNaN(num1) || isNaN(num2)) {
      document.getElementById('result').innerText = "Please enter valid numbers.";
  } else {
      const sum = num1 + num2;
      document.getElementById('result').innerText = "Sum: " + sum;
  }
}

// Register the service worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js').then((registration) => {
          console.log('ServiceWorker registered: ', registration);
      }).catch((error) => {
          console.log('ServiceWorker registration failed: ', error);
      });
  });
}
