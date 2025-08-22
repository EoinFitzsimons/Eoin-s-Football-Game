// Three.js CDN loader for browser
export function loadThreeJs(callback) {
  if (window.THREE) return callback(window.THREE);
  const script = document.createElement('script');
  script.src = 'https://cdn.jsdelivr.net/npm/three@0.152.2/build/three.min.js';
  script.onload = () => callback(window.THREE);
  document.head.appendChild(script);
}
