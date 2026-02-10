/**
 * Safely parses a date value and converts it to ISO string format (YYYY-MM-DD)
 * Handles DD/MM/YYYY format, empty strings, null, and invalid dates
 * Never throws - always returns null for invalid values
 * @param value - Date value (string in DD/MM/YYYY or ISO format, Date object, null, undefined, or empty string)
 * @returns ISO date string (YYYY-MM-DD) or null if invalid/empty
 */
export function safeParseDate(value?: string | Date | null): string | null {
  try {
    // Handle null, undefined, or empty string
    if (!value || value === '') {
      return null;
    }

    // If already a Date object, check if valid
    if (value instanceof Date) {
      if (isNaN(value.getTime())) {
        return null;
      }
      return value.toISOString().split('T')[0];
    }

    // If string, try to parse
    if (typeof value === 'string') {
      // Check for empty or whitespace-only strings
      const trimmed = value.trim();
      if (trimmed === '') {
        return null;
      }

      // Check if it's in DD/MM/YYYY format (e.g., "15/01/2000")
      const ddmmyyyyPattern = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/;
      const ddmmyyyyMatch = trimmed.match(ddmmyyyyPattern);
      
      if (ddmmyyyyMatch) {
        // Parse DD/MM/YYYY format
        const day = parseInt(ddmmyyyyMatch[1], 10);
        const month = parseInt(ddmmyyyyMatch[2], 10);
        const year = parseInt(ddmmyyyyMatch[3], 10);
        
        // Validate date components
        if (day < 1 || day > 31 || month < 1 || month > 12 || year < 1900 || year > 2100) {
          console.warn('[safeParseDate] Invalid DD/MM/YYYY date components:', { day, month, year, original: value });
          return null;
        }
        
        // Create date object (month is 0-indexed in JavaScript Date)
        const date = new Date(year, month - 1, day);
        
        // Verify the date is valid (handles invalid dates like 31/02/2000)
        if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
          console.warn('[safeParseDate] Invalid date (e.g., 31/02):', value);
          return null;
        }
        
        // Check if date is valid
        if (isNaN(date.getTime())) {
          console.warn('[safeParseDate] Invalid date value:', value);
          return null;
        }
        
        // Return ISO string in YYYY-MM-DD format
        return date.toISOString().split('T')[0];
      }

      // Try to parse as ISO format or other standard formats
      const date = new Date(trimmed);
      
      // Check if date is valid
      if (isNaN(date.getTime())) {
        console.warn('[safeParseDate] Invalid date value:', value);
        return null;
      }

      // Return ISO string in YYYY-MM-DD format
      return date.toISOString().split('T')[0];
    }

    // Fallback for any other type
    console.warn('[safeParseDate] Unexpected date value type:', typeof value, value);
    return null;
  } catch (error) {
    // Never throw - return null on any error
    console.warn('[safeParseDate] Error parsing date:', value, error);
    return null;
  }
}

/**
 * Safely creates a Date object from a date string
 * Returns null for invalid dates instead of throwing
 * @param value - Date string (DD/MM/YYYY or ISO format) or Date object
 * @returns Date object or null if invalid
 */
export function safeCreateDate(value?: string | Date | null): Date | null {
  try {
    if (!value) {
      return null;
    }

    if (value instanceof Date) {
      return isNaN(value.getTime()) ? null : value;
    }

    if (typeof value === 'string') {
      const trimmed = value.trim();
      if (trimmed === '') {
        return null;
      }

      // Handle DD/MM/YYYY format
      const ddmmyyyyPattern = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/;
      const ddmmyyyyMatch = trimmed.match(ddmmyyyyPattern);
      
      if (ddmmyyyyMatch) {
        const day = parseInt(ddmmyyyyMatch[1], 10);
        const month = parseInt(ddmmyyyyMatch[2], 10);
        const year = parseInt(ddmmyyyyMatch[3], 10);
        
        if (day < 1 || day > 31 || month < 1 || month > 12 || year < 1900 || year > 2100) {
          return null;
        }
        
        const date = new Date(year, month - 1, day);
        
        // Verify the date is valid
        if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
          return null;
        }
        
        return isNaN(date.getTime()) ? null : date;
      }

      // Try standard date parsing
      const date = new Date(trimmed);
      return isNaN(date.getTime()) ? null : date;
    }

    return null;
  } catch (error) {
    return null;
  }
}

/**
 * Safely formats a date string for display
 * Returns empty string or fallback for invalid dates
 * @param dateString - Date string (DD/MM/YYYY or ISO format)
 * @param fallback - Fallback string if date is invalid (default: '')
 * @returns Formatted date string or fallback
 */
export function safeFormatDate(dateString: string | null | undefined, fallback: string = ''): string {
  if (!dateString) {
    return fallback;
  }

  const date = safeCreateDate(dateString);
  if (!date) {
    return fallback;
  }

  try {
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  } catch (error) {
    return fallback;
  }
}
