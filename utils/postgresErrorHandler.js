/**
 * PostgreSQL Error Handler Utility
 * Provides detailed error messages for PostgreSQL database errors
 */

export function handlePostgresError(error) {
    // Default error response structure
    const errorResponse = {
        success: false,
        message: 'Database error occurred',
        code: error.code || 'UNKNOWN_ERROR',
        details: null,
        field: null,
        constraint: null
    };

    // Handle different PostgreSQL error codes
    switch (error.code) {
        // Unique violation
        case '23505':
            errorResponse.message = 'Duplicate entry detected';
            errorResponse.details = parseDuplicateKeyError(error);
            errorResponse.field = extractFieldFromError(error);
            break;

        // Foreign key violation
        case '23503':
            errorResponse.message = 'Referenced record does not exist';
            errorResponse.details = parseForeignKeyError(error);
            errorResponse.constraint = error.constraint;
            break;

        // Not null violation
        case '23502':
            errorResponse.message = 'Required field is missing';
            errorResponse.details = `Field '${error.column}' cannot be null`;
            errorResponse.field = error.column;
            break;

        // Check violation
        case '23514':
            errorResponse.message = 'Data validation failed';
            errorResponse.details = parseCheckConstraintError(error);
            errorResponse.constraint = error.constraint;
            break;

        // Invalid text representation
        case '22P02':
            errorResponse.message = 'Invalid data format';
            errorResponse.details = 'The provided data format is invalid for the expected type';
            break;

        // Numeric value out of range
        case '22003':
            errorResponse.message = 'Numeric value out of range';
            errorResponse.details = 'The provided numeric value exceeds the allowed range';
            break;

        // Division by zero
        case '22012':
            errorResponse.message = 'Division by zero error';
            errorResponse.details = 'Cannot divide by zero';
            break;

        // Invalid datetime format
        case '22007':
            errorResponse.message = 'Invalid datetime format';
            errorResponse.details = 'The provided datetime value is not in a valid format';
            break;

        // String data too long
        case '22001':
            errorResponse.message = 'Data too long';
            errorResponse.details = parseStringTooLongError(error);
            break;

        // Connection errors
        case 'ECONNREFUSED':
            errorResponse.message = 'Database connection refused';
            errorResponse.details = 'Unable to connect to the database server';
            break;

        case 'ENOTFOUND':
            errorResponse.message = 'Database server not found';
            errorResponse.details = 'Could not resolve database server hostname';
            break;

        case 'ECONNRESET':
            errorResponse.message = 'Database connection lost';
            errorResponse.details = 'Connection to database was reset';
            break;

        // Syntax errors
        case '42601':
            errorResponse.message = 'SQL syntax error';
            errorResponse.details = 'There is a syntax error in the SQL query';
            break;

        // Undefined table
        case '42P01':
            errorResponse.message = 'Table does not exist';
            errorResponse.details = parseUndefinedTableError(error);
            break;

        // Undefined column
        case '42703':
            errorResponse.message = 'Column does not exist';
            errorResponse.details = parseUndefinedColumnError(error);
            break;

        // Permission denied
        case '42501':
            errorResponse.message = 'Permission denied';
            errorResponse.details = 'Insufficient privileges to perform this operation';
            break;

        // Database does not exist
        case '3D000':
            errorResponse.message = 'Database does not exist';
            errorResponse.details = 'The specified database could not be found';
            break;

        // Too many connections
        case '53300':
            errorResponse.message = 'Too many connections';
            errorResponse.details = 'Database server has reached maximum connection limit';
            break;

        // Disk full
        case '53100':
            errorResponse.message = 'Disk full';
            errorResponse.details = 'Database server storage is full';
            break;

        // Default case for unhandled errors
        default:
            errorResponse.message = error.message || 'An unexpected database error occurred';
            errorResponse.details = getGenericErrorDetails(error);
            break;
    }

    return errorResponse;
}

/**
 * Parse duplicate key error to extract meaningful information
 */
function parseDuplicateKeyError(error) {
    const detail = error.detail || '';
    
    // Extract key and value from error detail
    const keyMatch = detail.match(/Key \(([^)]+)\)=\(([^)]+)\)/);
    if (keyMatch) {
        const field = keyMatch[1];
        const value = keyMatch[2];
        return `A record with ${field} '${value}' already exists`;
    }
    
    return 'A record with these values already exists';
}

/**
 * Parse foreign key error to extract meaningful information
 */
function parseForeignKeyError(error) {
    const detail = error.detail || '';
    
    // Extract key and value information
    const keyMatch = detail.match(/Key \(([^)]+)\)=\(([^)]+)\)/);
    if (keyMatch) {
        const field = keyMatch[1];
        const value = keyMatch[2];
        return `Referenced ${field} '${value}' does not exist`;
    }
    
    return 'Referenced record does not exist';
}

/**
 * Parse check constraint error
 */
function parseCheckConstraintError(error) {
    const constraintName = error.constraint || 'unknown constraint';
    return `Data violates constraint: ${constraintName}`;
}

/**
 * Parse string too long error
 */
function parseStringTooLongError(error) {
    const detail = error.detail || '';
    return detail || 'The provided text is too long for the field';
}

/**
 * Parse undefined table error
 */
function parseUndefinedTableError(error) {
    const message = error.message || '';
    const tableMatch = message.match(/relation "([^"]+)" does not exist/);
    if (tableMatch) {
        return `Table '${tableMatch[1]}' does not exist`;
    }
    return 'The specified table does not exist';
}

/**
 * Parse undefined column error
 */
function parseUndefinedColumnError(error) {
    const message = error.message || '';
    const columnMatch = message.match(/column "([^"]+)" does not exist/);
    if (columnMatch) {
        return `Column '${columnMatch[1]}' does not exist`;
    }
    return 'The specified column does not exist';
}

/**
 * Extract field name from error message
 */
function extractFieldFromError(error) {
    const detail = error.detail || '';
    const keyMatch = detail.match(/Key \(([^)]+)\)/);
    return keyMatch ? keyMatch[1] : null;
}

/**
 * Get generic error details for unhandled cases
 */
function getGenericErrorDetails(error) {
    const details = [];
    
    if (error.severity) details.push(`Severity: ${error.severity}`);
    if (error.routine) details.push(`Routine: ${error.routine}`);
    if (error.file) details.push(`File: ${error.file}`);
    if (error.line) details.push(`Line: ${error.line}`);
    
    return details.length > 0 ? details.join(', ') : error.message || 'Unknown error';
}

/**
 * Simplified error handler for common use cases
 */
export function getSimplePostgresError(error) {
    const handled = handlePostgresError(error);
    return {
        message: handled.message,
        field: handled.field || 'general'
    };
}

/**
 * Format error for API responses
 */
export function formatPostgresErrorForAPI(error, customMessage = null) {
    const handled = handlePostgresError(error);
    
    return {
        success: false,
        message: customMessage || handled.message,
        error: {
            code: handled.code,
            details: handled.details,
            field: handled.field,
            constraint: handled.constraint
        },
        data: null
    };
}

/**
 * Log detailed error information (for debugging)
 */
export function logPostgresError(error, context = '') {
    const handled = handlePostgresError(error);
    
    console.error('=== PostgreSQL Error ===');
    if (context) console.error(`Context: ${context}`);
    console.error(`Code: ${handled.code}`);
    console.error(`Message: ${handled.message}`);
    console.error(`Details: ${handled.details}`);
    if (handled.field) console.error(`Field: ${handled.field}`);
    if (handled.constraint) console.error(`Constraint: ${handled.constraint}`);
    console.error('Original Error:', error);
    console.error('========================');
    
    return handled;
}