import React from 'react';
import { Alert, AlertTitle, Box, Collapse, List, ListItem, Typography } from '@mui/material';

interface FormErrorAlertProps {
  error: string | null;
  fieldErrors?: Record<string, string>;
  title?: string;
  showDetails?: boolean;
}

/**
 * A component that displays form errors in an alert with optional field-specific details
 */
const FormErrorAlert: React.FC<FormErrorAlertProps> = ({
  error,
  fieldErrors = {},
  title = 'Form Error',
  showDetails = true
}) => {
  const hasFieldErrors = Object.keys(fieldErrors).length > 0;
  const hasError = !!error || hasFieldErrors;
  
  if (!hasError) return null;
  
  return (
    <Alert 
      severity="error" 
      sx={{ 
        mb: 3,
        borderRadius: 2,
        backgroundColor: '#ffffff',
        border: '1px solid #ef4444',
        '& .MuiAlert-icon': {
          color: '#ef4444'
        }
      }}
    >
      <AlertTitle>{title}</AlertTitle>
      
      {/* Main error message */}
      {error && (
        <Typography variant="body2" sx={{ mb: hasFieldErrors ? 1 : 0 }}>
          {error}
        </Typography>
      )}
      
      {/* Field-specific errors */}
      <Collapse in={showDetails && hasFieldErrors}>
        {hasFieldErrors && (
          <Box sx={{ mt: 1 }}>
            <Typography variant="body2" fontWeight={500}>
              Please correct the following:
            </Typography>
            <List dense disablePadding sx={{ mt: 0.5 }}>
              {Object.entries(fieldErrors).map(([field, message]) => (
                <ListItem key={field} disableGutters sx={{ py: 0.25 }}>
                  <Typography variant="caption" sx={{ color: 'error.main' }}>
                    • <b>{field.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</b>: {message}
                  </Typography>
                </ListItem>
              ))}
            </List>
          </Box>
        )}
      </Collapse>
    </Alert>
  );
};

export default FormErrorAlert;
