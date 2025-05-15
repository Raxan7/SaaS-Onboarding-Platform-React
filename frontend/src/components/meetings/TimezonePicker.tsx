import React, { useState, useEffect } from 'react';
import { 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  TextField, 
  FormHelperText,
  Box
} from '@mui/material';
import { Autocomplete } from '@mui/material';

// List of common timezones with their offset and region
const TIMEZONES = [
  { value: 'UTC-12:00', label: '(UTC-12:00) International Date Line West' },
  { value: 'UTC-11:00', label: '(UTC-11:00) Samoa, Midway Island' },
  { value: 'UTC-10:00', label: '(UTC-10:00) Hawaii' },
  { value: 'UTC-09:00', label: '(UTC-09:00) Alaska' },
  { value: 'UTC-08:00', label: '(UTC-08:00) Pacific Time (US & Canada)' },
  { value: 'UTC-07:00', label: '(UTC-07:00) Mountain Time (US & Canada)' },
  { value: 'UTC-06:00', label: '(UTC-06:00) Central Time (US & Canada), Mexico City' },
  { value: 'UTC-05:00', label: '(UTC-05:00) Eastern Time (US & Canada), Bogota, Lima' },
  { value: 'UTC-04:00', label: '(UTC-04:00) Atlantic Time (Canada), Caracas, La Paz' },
  { value: 'UTC-03:30', label: '(UTC-03:30) Newfoundland' },
  { value: 'UTC-03:00', label: '(UTC-03:00) Brazil, Buenos Aires, Georgetown' },
  { value: 'UTC-02:00', label: '(UTC-02:00) Mid-Atlantic' },
  { value: 'UTC-01:00', label: '(UTC-01:00) Azores, Cape Verde Islands' },
  { value: 'UTC+00:00', label: '(UTC+00:00) London, Lisbon, Casablanca' },
  { value: 'UTC+01:00', label: '(UTC+01:00) Berlin, Brussels, Madrid, Paris' },
  { value: 'UTC+02:00', label: '(UTC+02:00) Athens, Istanbul, Cairo, Helsinki' },
  { value: 'UTC+03:00', label: '(UTC+03:00) Moscow, Nairobi, Baghdad, Kuwait' },
  { value: 'UTC+03:30', label: '(UTC+03:30) Tehran' },
  { value: 'UTC+04:00', label: '(UTC+04:00) Abu Dhabi, Muscat, Baku, Tbilisi' },
  { value: 'UTC+04:30', label: '(UTC+04:30) Kabul' },
  { value: 'UTC+05:00', label: '(UTC+05:00) Islamabad, Karachi, Tashkent' },
  { value: 'UTC+05:30', label: '(UTC+05:30) Chennai, Kolkata, Mumbai, New Delhi' },
  { value: 'UTC+05:45', label: '(UTC+05:45) Kathmandu' },
  { value: 'UTC+06:00', label: '(UTC+06:00) Astana, Dhaka, Novosibirsk' },
  { value: 'UTC+06:30', label: '(UTC+06:30) Yangon (Rangoon)' },
  { value: 'UTC+07:00', label: '(UTC+07:00) Bangkok, Hanoi, Jakarta' },
  { value: 'UTC+08:00', label: '(UTC+08:00) Beijing, Singapore, Hong Kong, Perth' },
  { value: 'UTC+09:00', label: '(UTC+09:00) Tokyo, Seoul, Osaka, Sapporo' },
  { value: 'UTC+09:30', label: '(UTC+09:30) Adelaide, Darwin' },
  { value: 'UTC+10:00', label: '(UTC+10:00) Brisbane, Canberra, Melbourne, Sydney' },
  { value: 'UTC+11:00', label: '(UTC+11:00) Magadan, Solomon Islands, New Caledonia' },
  { value: 'UTC+12:00', label: '(UTC+12:00) Auckland, Wellington, Fiji, Kamchatka' },
  { value: 'UTC+13:00', label: '(UTC+13:00) Nuku\'alofa' },
];

// Try to detect user's timezone
const getUserTimezone = () => {
  try {
    const timeZoneOffset = -new Date().getTimezoneOffset();
    const hours = Math.floor(Math.abs(timeZoneOffset) / 60);
    const minutes = Math.abs(timeZoneOffset) % 60;
    
    const sign = timeZoneOffset >= 0 ? '+' : '-';
    const formattedHours = hours.toString().padStart(2, '0');
    const formattedMinutes = minutes.toString().padStart(2, '0');
    
    return `UTC${sign}${formattedHours}:${formattedMinutes}`;
  } catch (error) {
    console.error('Error detecting timezone:', error);
    return 'UTC+00:00'; // Default to UTC
  }
};

interface TimezonePickerProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  required?: boolean;
  error?: boolean;
  helperText?: string;
  disabled?: boolean;
}

const TimezonePicker: React.FC<TimezonePickerProps> = ({
  value,
  onChange,
  label = 'Timezone',
  required = false,
  error = false,
  helperText = '',
  disabled = false,
}) => {
  const [searchText, setSearchText] = useState('');
  
  // Set user's timezone as default when component mounts if no value is provided
  useEffect(() => {
    if (!value) {
      const userTimezone = getUserTimezone();
      const matchingTimezone = TIMEZONES.find(tz => tz.value === userTimezone);
      if (matchingTimezone) {
        onChange(matchingTimezone.value);
      } else {
        onChange('UTC+00:00'); // Fallback to UTC if no match
      }
    }
  }, [value, onChange]);

  return (
    <Autocomplete
      value={value ? TIMEZONES.find(option => option.value === value) || null : null}
      onChange={(event, newValue) => {
        onChange(newValue ? newValue.value : '');
      }}
      inputValue={searchText}
      onInputChange={(event, newInputValue) => {
        setSearchText(newInputValue);
      }}
      options={TIMEZONES}
      getOptionLabel={(option) => option.label}
      renderInput={(params) => (
        <TextField
          {...params}
          label={label}
          required={required}
          error={error}
          helperText={helperText}
          fullWidth
        />
      )}
      disabled={disabled}
      isOptionEqualToValue={(option, value) => option.value === value.value}
    />
  );
};

export default TimezonePicker;