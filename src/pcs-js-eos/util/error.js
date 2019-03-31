'use strict'

// Unique Error type for scatter.js
export class ScatterError extends Error {
    constructor(errorCode = ErrorCodes.OTHERS, errorType = "no_type", ...params) {
        super(...params);

        Object.defineProperty(this, 'name', {
            configurable: true,
            enumerable: false,
            value: this.constructor.name,
            writable: true,
        });

        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, ScatterError);
        }

        this.errorCode = errorCode;
        this.errorType = errorType;
    }
}

// error code for ScatterError
export const ErrorCodes = {
    // GetScatter/scatter-js native error code
    NO_SIGNATURE: 402,
    FORBIDDEN: 403,
    TIMED_OUT: 408,
    LOCKED: 423,
    UPGRADE_REQUIRED: 426,
    TOO_MANY_REQUESTS: 429,
    // unique error code
    INVALID_VALUE: 498,
    OTHERS: 499
};
