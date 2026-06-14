/**
 * Utility functions for formatting data in the internship recommendation system
 */

/**
 * Format currency amount to Indian Rupee format
 * @param amount - The amount to format (can be string or number)
 * @returns Formatted currency string (e.g., "₹7,691")
 */
export function formatCurrency(amount: string | number): string {
  if (!amount || amount === 0 || amount === '0' || amount === '') {
    return '₹0 (Unpaid)';
  }
  
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(numAmount) || numAmount <= 0) {
    return '₹0 (Unpaid)';
  }
  
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(numAmount);
}

/**
 * Format date string to readable format
 * @param dateStr - Date string in various formats
 * @returns Formatted date string (e.g., "02 Aug 2026")
 */
export function formatDate(dateStr: string): string {
  if (!dateStr || dateStr.toLowerCase() === 'unknown' || dateStr === '') {
    return 'Rolling';
  }
  
  try {
    // Handle various date formats from the dataset
    let date: Date;
    
    if (dateStr.includes('-')) {
      // Handle DD-MM-YY format
      const parts = dateStr.split('-');
      if (parts.length === 3) {
        const day = parts[0];
        const month = parts[1];
        const year = parts[2];
        // Convert 2-digit year to 4-digit
        const fullYear = year.length === 2 ? `20${year}` : year;
        date = new Date(`${fullYear}-${month}-${day}`);
      } else {
        date = new Date(dateStr);
      }
    } else {
      date = new Date(dateStr);
    }
    
    if (isNaN(date.getTime())) {
      return 'Rolling';
    }
    
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  } catch (error) {
    return 'Rolling';
  }
}

/**
 * Format location string to clean format
 * @param location - Location string (e.g., "Mumbai, unknown")
 * @returns Clean location string (e.g., "Mumbai")
 */
export function formatLocation(location: string): string {
  if (!location || location.toLowerCase() === 'unknown' || location === '') {
    return 'Remote';
  }
  
  // Remove "unknown" and clean up the string
  const cleaned = location
    .replace(/,?\s*unknown/gi, '')
    .replace(/,\s*$/, '')
    .trim();
  
  return cleaned || 'Remote';
}

/**
 * Format duration string to clean format
 * @param duration - Duration string from dataset
 * @returns Clean duration string (e.g., "1-3 months")
 */
export function formatDuration(duration: string): string {
  if (!duration || duration.toLowerCase() === 'unknown' || duration === '') {
    return '1-3 months';
  }
  
  // Clean up duration format
  const cleaned = duration
    .replace(/\s*months?/gi, ' months')
    .replace(/\s*month/gi, ' month')
    .trim();
  
  return cleaned || '1-3 months';
}

/**
 * Format organization name with fallback
 * @param organization - Organization name
 * @returns Clean organization name
 */
export function formatOrganization(organization: string): string {
  if (!organization || 
      organization.toLowerCase() === 'unknown' || 
      organization.toLowerCase() === 'not specified' ||
      organization === '') {
    return 'General Organization';
  }
  
  return organization.trim();
}

/**
 * Format title with fallback
 * @param title - Internship title
 * @returns Clean title
 */
export function formatTitle(title: string): string {
  if (!title || title.toLowerCase() === 'unknown' || title === '') {
    return 'Internship Opportunity';
  }
  
  return title.trim();
}

/**
 * Format match percentage
 * @param score - Match score (0-1 or 0-100)
 * @returns Formatted percentage string
 */
export function formatMatchPercent(score: number): string {
  if (typeof score !== 'number' || isNaN(score)) {
    return '0%';
  }
  
  // If score is already a percentage (0-100), use it directly
  // If score is a decimal (0-1), convert to percentage
  const percent = score > 1 ? score : score * 100;
  
  return `${Math.round(percent * 10) / 10}%`;
}

/**
 * Format skills/tags as comma-separated list
 * @param skills - Skills string or array
 * @returns Cleaned skills string
 */
export function formatSkills(skills: string | string[]): string {
  if (!skills) return '';
  
  if (Array.isArray(skills)) {
    return skills.filter(s => s && s.trim()).join(', ');
  }
  
  if (typeof skills === 'string') {
    return skills
      .split(',')
      .map(s => s.trim())
      .filter(s => s && s !== 'unknown')
      .join(', ');
  }
  
  return '';
}

/**
 * Format tools used as comma-separated list
 * @param tools - Tools string
 * @returns Cleaned tools string
 */
export function formatTools(tools: string): string {
  if (!tools || tools.toLowerCase() === 'unknown' || tools === '') {
    return '';
  }
  
  return tools
    .split(',')
    .map(t => t.trim())
    .filter(t => t && t !== 'unknown')
    .join(', ');
}

/**
 * Format tags as comma-separated list
 * @param tags - Tags string
 * @returns Cleaned tags string
 */
export function formatTags(tags: string): string {
  if (!tags || tags.toLowerCase() === 'unknown' || tags === '') {
    return '';
  }
  
  return tags
    .split(',')
    .map(t => t.trim())
    .filter(t => t && t !== 'unknown')
    .join(', ');
}

/**
 * Format city and state combination
 * @param city - City name
 * @param state - State name
 * @returns Formatted location string
 */
export function formatCityState(city: string, state: string): string {
  const cleanCity = city && city.toLowerCase() !== 'unknown' ? city.trim() : '';
  const cleanState = state && state.toLowerCase() !== 'unknown' ? state.trim() : '';
  
  if (cleanCity && cleanState) {
    return `${cleanCity}, ${cleanState}`;
  } else if (cleanCity) {
    return cleanCity;
  } else if (cleanState) {
    return cleanState;
  }
  
  return 'Remote';
}

/**
 * Format experience level with proper casing
 * @param level - Experience level string
 * @returns Formatted experience level
 */
export function formatExperienceLevel(level: string): string {
  if (!level || level.toLowerCase() === 'unknown' || level === '') {
    return 'Any Level';
  }
  
  return level
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

/**
 * Format education level with proper casing
 * @param level - Education level string
 * @returns Formatted education level
 */
export function formatEducationLevel(level: string): string {
  if (!level || level.toLowerCase() === 'unknown' || level === '') {
    return 'Any Level';
  }
  
  // Handle special cases
  const levelMap: { [key: string]: string } = {
    '12th pass': '12th Pass',
    'ug': 'UG',
    'pg': 'PG',
    'diploma': 'Diploma'
  };
  
  const lowerLevel = level.toLowerCase().trim();
  return levelMap[lowerLevel] || level
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

/**
 * Format mode with proper casing
 * @param mode - Mode string
 * @returns Formatted mode
 */
export function formatMode(mode: string): string {
  if (!mode || mode.toLowerCase() === 'unknown' || mode === '') {
    return 'Flexible';
  }
  
  const modeMap: { [key: string]: string } = {
    'online': 'Online',
    'offline': 'Offline',
    'hybrid': 'Hybrid'
  };
  
  const lowerMode = mode.toLowerCase().trim();
  return modeMap[lowerMode] || mode.charAt(0).toUpperCase() + mode.slice(1).toLowerCase();
}

/**
 * Generic fallback utility
 * @param value - Value to check
 * @param fallbackValue - Fallback if value is falsy
 * @returns Value or fallback
 */
export function fallback<T>(value: T, fallbackValue: T): T {
  if (value === null || value === undefined || value === '' || 
      (typeof value === 'string' && value.toLowerCase() === 'unknown')) {
    return fallbackValue;
  }
  return value;
}
