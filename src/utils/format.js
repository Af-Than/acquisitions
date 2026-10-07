export const formatValidationErrors = (errors) => {

    if(!errors || !errors.issues) {
        return {"error": "Invalid errors object"};
    }
    
    if(Array.isArray(errors.issues)) {
        const formattedErrors = errors.issues.map((issue) => {
            return {
                field: issue.path.join('.'),
                message: issue.message,
            };
        });

        return formattedErrors;
    }

    return {"error": "Invalid errors object"};
}