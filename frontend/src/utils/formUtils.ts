/**
 * Helper utilities for form handling and error management
 */

/**
 * Parse API error message into a structured format
 * @param error - Error object or string from API client
 * @returns Formatted error object with field-specific and general errors
 */
export const parseFormErrors = (error: any) => {
  let fieldErrors: Record<string, string> = {};
  let generalError = '';

  if (!error) {
    return { fieldErrors, generalError };
  }

  const errorMessage = error.message || error.toString();
  
  // Check if the error message looks like field-specific errors
  if (errorMessage.includes(': ') && errorMessage.includes('. ')) {
    // Split by period to get individual field errors
    const errorParts = errorMessage.split('. ');
    
    errorParts.forEach(part => {
      const match = part.match(/^([^:]+): (.+)$/);
      if (match) {
        const [, field, message] = match;
        // Convert Django-style field names to camelCase for frontend
        const formattedField = field
          .replace(/^[_\s]+|[_\s]+$/g, '')
          .replace(/_([a-z])/g, (g) => g[1].toUpperCase());
        
        fieldErrors[formattedField] = message;
      } else {
        // If it doesn't match the field pattern, add to general error
        generalError = generalError ? `${generalError}. ${part}` : part;
      }
    });
  } else {
    generalError = errorMessage;
  }

  return { fieldErrors, generalError };
};

/**
 * Formats a camelCase or snake_case field name into a human-readable label
 * @param fieldName - The field name to format
 * @returns Formatted field name with spaces and capitalized first letter
 */
export const formatFieldName = (fieldName: string): string => {
  // Convert camelCase or snake_case to space-separated words
  const formatted = fieldName
    .replace(/([A-Z])/g, ' $1') // Add spaces before capital letters
    .replace(/_/g, ' ') // Replace underscores with spaces
    .trim(); 
  
  // Capitalize the first letter
  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
};

/**
 * Validates if a form field is required and has a value
 * @param value - The field value to check
 * @param isRequired - Whether the field is required
 * @returns Error message or empty string
 */
export const validateRequiredField = (value: any, isRequired: boolean): string => {
  if (!isRequired) return '';
  
  if (value === undefined || value === null || value === '') {
    return 'This field is required';
  }
  
  if (Array.isArray(value) && value.length === 0) {
    return 'Please select at least one option';
  }
  
  return '';
};

/**
 * Check if an email address format is valid
 * @param email - The email address to validate
 * @returns True if valid, false otherwise
 */
export const isValidEmail = (email: string): boolean => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

/**
 * Validates if a field meets minimum length requirement
 * @param value - The field value to check
 * @param minLength - Minimum length required
 * @returns Error message or empty string
 */
export const validateMinLength = (value: string, minLength: number): string => {
  if (!value) return '';
  
  if (value.length < minLength) {
    return `Must be at least ${minLength} characters`;
  }
  
  return '';
};
