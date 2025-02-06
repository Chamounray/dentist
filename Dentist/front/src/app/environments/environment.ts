export const environment = {
    production: false,
    apiUrl: 'http://localhost:5000/api',
    tokenExpiryCheckInterval: 5 * 60 * 1000, // 5 minutes
    snackbarDuration: 3000,
    defaultPaginationLimit: 10,
    maxFileSize: 5 * 1024 * 1024, // 5MB
    allowedFileTypes: ['image/jpeg', 'image/png', 'application/pdf'],
    dateFormat: 'MMM dd, yyyy',
    timeFormat: 'HH:mm',
    defaultLanguage: 'en',
    debounceTime: 300,
  };