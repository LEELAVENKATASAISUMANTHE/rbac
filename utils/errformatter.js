
export async function formatError(error) {
    // Check if the error is a Joi validation error
    if (error && error.details && Array.isArray(error.details)) {
        const formattedErrors = error.details.map(err => ({
            field: err.path.join('.'),
            message: err.message
        }));
        return formattedErrors;
    }
    
    // Handle other types of errors
    if (error) {
        return [{
            field: 'general',
            message: error.message || 'An unknown error occurred'
        }];
    }
    
    // Return empty array if no error
    return [];
};