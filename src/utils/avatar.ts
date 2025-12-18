/**
 * Generate a default avatar URL based on username
 * Creates an orange-black pattern avatar for DarkTube theming
 */
export function generateAvatarUrl(username: string): string {
  // Create a deterministic hash from username
  const hash = hashString(username);
  
  // Generate pattern parameters based on hash
  const patternType = hash % 3; // 0: geometric, 1: abstract, 2: initials
  const colorVariant = (hash >> 2) % 5; // Different orange shades
  
  // Orange color variants for DarkTube theme
  const orangeShades = [
    '#FF6600', // Primary orange
    '#FF7700', // Lighter orange
    '#FF5500', // Darker orange
    '#FF8800', // Warm orange
    '#FF4400'  // Deep orange
  ];
  
  const primaryColor = orangeShades[colorVariant];
  const backgroundColor = '#121212'; // DarkTube charcoal
  
  // For now, return a data URL with SVG pattern
  // In production, this would generate actual image files
  return generateSVGAvatar(username, primaryColor, backgroundColor, patternType);
}

/**
 * Generate SVG avatar as data URL
 */
function generateSVGAvatar(
  username: string, 
  primaryColor: string, 
  backgroundColor: string, 
  patternType: number
): string {
  const initials = getInitials(username);
  const hash = hashString(username);
  
  let svgContent = '';
  
  switch (patternType) {
    case 0: // Geometric pattern
      svgContent = generateGeometricPattern(hash, primaryColor, backgroundColor);
      break;
    case 1: // Abstract pattern
      svgContent = generateAbstractPattern(hash, primaryColor, backgroundColor);
      break;
    case 2: // Initials
    default:
      svgContent = generateInitialsPattern(initials, primaryColor, backgroundColor);
      break;
  }
  
  const svg = `
    <svg width="100" height="100" xmlns="http://www.w3.org/2000/svg">
      <rect width="100" height="100" fill="${backgroundColor}"/>
      ${svgContent}
    </svg>
  `;
  
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
}

/**
 * Generate geometric pattern
 */
function generateGeometricPattern(hash: number, primaryColor: string, backgroundColor: string): string {
  const shapes = [];
  
  // Generate multiple geometric shapes
  for (let i = 0; i < 5; i++) {
    const x = (hash >> (i * 2)) % 80 + 10;
    const y = (hash >> (i * 2 + 1)) % 80 + 10;
    const size = (hash >> (i * 3)) % 20 + 10;
    const opacity = 0.3 + ((hash >> (i * 4)) % 50) / 100;
    
    if (i % 2 === 0) {
      // Circle
      shapes.push(`<circle cx="${x}" cy="${y}" r="${size/2}" fill="${primaryColor}" opacity="${opacity}"/>`);
    } else {
      // Rectangle
      shapes.push(`<rect x="${x-size/2}" y="${y-size/2}" width="${size}" height="${size}" fill="${primaryColor}" opacity="${opacity}"/>`);
    }
  }
  
  return shapes.join('');
}

/**
 * Generate abstract pattern
 */
function generateAbstractPattern(hash: number, primaryColor: string, backgroundColor: string): string {
  const paths = [];
  
  // Generate curved paths
  for (let i = 0; i < 3; i++) {
    const startX = (hash >> (i * 3)) % 100;
    const startY = (hash >> (i * 3 + 1)) % 100;
    const endX = (hash >> (i * 3 + 2)) % 100;
    const endY = (hash >> (i * 4)) % 100;
    const controlX = (hash >> (i * 4 + 1)) % 100;
    const controlY = (hash >> (i * 4 + 2)) % 100;
    const opacity = 0.4 + ((hash >> (i * 5)) % 40) / 100;
    
    paths.push(`
      <path d="M${startX},${startY} Q${controlX},${controlY} ${endX},${endY}" 
            stroke="${primaryColor}" 
            stroke-width="3" 
            fill="none" 
            opacity="${opacity}"/>
    `);
  }
  
  return paths.join('');
}

/**
 * Generate initials pattern
 */
function generateInitialsPattern(initials: string, primaryColor: string, backgroundColor: string): string {
  return `
    <text x="50" y="50" 
          font-family="Inter, sans-serif" 
          font-size="32" 
          font-weight="bold" 
          text-anchor="middle" 
          dominant-baseline="central" 
          fill="${primaryColor}">
      ${initials}
    </text>
  `;
}

/**
 * Get initials from username
 */
function getInitials(username: string): string {
  const cleaned = username.replace(/[^a-zA-Z0-9]/g, '');
  if (cleaned.length === 0) return 'DT'; // DarkTube default
  if (cleaned.length === 1) return cleaned.toUpperCase();
  
  // Take first and last character, or first two if same
  const first = cleaned[0].toUpperCase();
  const last = cleaned[cleaned.length - 1].toUpperCase();
  
  return first === last ? first + (cleaned[1] || '').toUpperCase() : first + last;
}

/**
 * Simple string hash function
 */
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash);
}

/**
 * Upload custom avatar
 */
export async function uploadAvatar(userId: string, file: File): Promise<string> {
  // Validate file
  if (!file.type.startsWith('image/')) {
    throw new Error('File must be an image');
  }
  
  if (file.size > 5 * 1024 * 1024) { // 5MB limit
    throw new Error('Image must be smaller than 5MB');
  }
  
  // In production, this would upload to CDN/S3
  // For now, return a placeholder URL
  const filename = `avatar_${userId}_${Date.now()}.${file.name.split('.').pop()}`;
  const avatarUrl = `${process.env.CDN_BASE_URL}/avatars/${filename}`;
  
  // TODO: Implement actual file upload logic
  // - Resize image to standard sizes (64x64, 128x128, 256x256)
  // - Apply orange border/frame for DarkTube branding
  // - Upload to CDN
  // - Update user record in database
  
  return avatarUrl;
}

/**
 * Generate channel banner with orange theming
 */
export function generateChannelBanner(channelName: string): string {
  const hash = hashString(channelName);
  const gradientAngle = hash % 360;
  
  const svg = `
    <svg width="1280" height="360" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%" gradientTransform="rotate(${gradientAngle})">
          <stop offset="0%" style="stop-color:#FF6600;stop-opacity:0.8" />
          <stop offset="50%" style="stop-color:#121212;stop-opacity:0.9" />
          <stop offset="100%" style="stop-color:#FF6600;stop-opacity:0.6" />
        </linearGradient>
      </defs>
      <rect width="1280" height="360" fill="url(#grad)"/>
      <text x="640" y="180" 
            font-family="Inter, sans-serif" 
            font-size="48" 
            font-weight="bold" 
            text-anchor="middle" 
            dominant-baseline="central" 
            fill="#FFFFFF"
            opacity="0.9">
        ${channelName}
      </text>
    </svg>
  `;
  
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
}