// Simple icon generator for PM Application
const fs = require('fs');
const path = require('path');

// Create a simple SVG icon
const createIconSVG = (size) => `
<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#2563eb;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#1d4ed8;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="100%" height="100%" fill="url(#grad)" rx="20"/>
  <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="${size * 0.4}" font-weight="bold" fill="white" text-anchor="middle" dominant-baseline="middle">PM</text>
</svg>`;

// Icon sizes needed
const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

console.log('Creating simple SVG icons...');

sizes.forEach(size => {
  const svg = createIconSVG(size);
  const filename = `icon-${size}x${size}.svg`;
  
  try {
    fs.writeFileSync(path.join(__dirname, filename), svg);
    console.log(`✅ Created ${filename}`);
  } catch (error) {
    console.error(`❌ Failed to create ${filename}:`, error.message);
  }
});

console.log('Icon generation complete!');
console.log('Note: These are SVG icons. For production, convert to PNG using an online converter or image processing tool.');
