class ApiError extends Error {
    statusCode: number;
    data: any;
    success: boolean;
    errors: any[];
    
    constructor(
        statusCode: number,
        message: string = "Something went wrong",
        errors: any[] = [],
        stack: string = ""
    ) {
        super(message);  // Call the parent class (Error) constructor with the message

        this.statusCode = statusCode;
        this.data = null;  // You can define the type of `data` later, if needed
        this.success = false;
        this.errors = errors;

        if (stack) {
            this.stack = stack;  // Use the provided stack if available
        } else {
            Error.captureStackTrace(this, this.constructor);  // Capture the stack trace if not provided
        }
    }
}

export { ApiError };