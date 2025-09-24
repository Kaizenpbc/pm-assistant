// PM Application Icon Creator
// Run this in Node.js to generate all required icon sizes

const fs = require('fs');
const path = require('path');

// Create a simple SVG icon for PM Application
const createSVGIcon = (size) => `
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#667eea;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#764ba2;stop-opacity:1" />
    </linearGradient>
  </defs>
  
  <!-- Background -->
  <rect width="${size}" height="${size}" rx="${size * 0.15}" fill="url(#grad)"/>
  
  <!-- Project Management Symbol (Calendar + Checkmark) -->
  <g transform="translate(${size * 0.2}, ${size * 0.15})">
    <!-- Calendar -->
    <rect x="0" y="${size * 0.1}" width="${size * 0.6}" height="${size * 0.5}" 
          rx="${size * 0.03}" fill="rgba(255,255,255,0.9)"/>
    <rect x="0" y="${size * 0.1}" width="${size * 0.6}" height="${size * 0.15}" 
          rx="${size * 0.03}" fill="rgba(255,255,255,0.7)"/>
    
    <!-- Calendar rings -->
    <rect x="${size * 0.15}" y="0" width="${size * 0.05}" height="${size * 0.2}" 
          rx="${size * 0.025}" fill="rgba(255,255,255,0.8)"/>
    <rect x="${size * 0.4}" y="0" width="${size * 0.05}" height="${size * 0.2}" 
          rx="${size * 0.025}" fill="rgba(255,255,255,0.8)"/>
    
    <!-- Calendar lines -->
    <line x1="${size * 0.1}" y1="${size * 0.3}" x2="${size * 0.5}" y2="${size * 0.3}" 
          stroke="rgba(102,126,234,0.6)" stroke-width="${size * 0.02}"/>
    <line x1="${size * 0.1}" y1="${size * 0.4}" x2="${size * 0.5}" y2="${size * 0.4}" 
          stroke="rgba(102,126,234,0.6)" stroke-width="${size * 0.02}"/>
    <line x1="${size * 0.1}" y1="${size * 0.5}" x2="${size * 0.35}" y2="${size * 0.5}" 
          stroke="rgba(102,126,234,0.6)" stroke-width="${size * 0.02}"/>
  </g>
  
  <!-- Checkmark -->
  <g transform="translate(${size * 0.65}, ${size * 0.65})">
    <path d="M 0,${size * 0.1} L ${size * 0.15},${size * 0.25} L ${size * 0.3},0" 
          stroke="rgba(255,255,255,0.9)" stroke-width="${size * 0.08}" 
          fill="none" stroke-linecap="round" stroke-linejoin="round"/>
  </g>
  
  <!-- PM Text (for larger icons) -->
  ${size >= 128 ? `
  <text x="${size/2}" y="${size * 0.85}" text-anchor="middle" 
        fill="rgba(255,255,255,0.8)" font-family="Arial, sans-serif" 
        font-size="${size * 0.12}" font-weight="bold">PM</text>
  ` : ''}
</svg>
`;

// Icon sizes needed
const sizes = [16, 32, 72, 96, 128, 144, 152, 192, 384, 512];

console.log('🎨 Creating PM Application icons...');

// Create icons directory if it doesn't exist
const iconsDir = path.join(__dirname);
if (!fs.existsSync(iconsDir)) {
    fs.mkdirSync(iconsDir, { recursive: true });
}

// Generate SVG icons for each size
sizes.forEach(size => {
    const svgContent = createSVGIcon(size);
    const filename = `icon-${size}x${size}.svg`;
    const filepath = path.join(iconsDir, filename);
    
    fs.writeFileSync(filepath, svgContent);
    console.log(`✅ Created ${filename}`);
});

console.log('\n🎉 All SVG icons created!');
console.log('\n📝 Next steps:');
console.log('1. Convert SVG files to PNG using an online converter or image editor');
console.log('2. Or use the icon-generator.html file in your browser');
console.log('3. Replace the SVG files with PNG versions');
console.log('\n💡 Recommended: Use the icon-generator.html for PNG generation');
