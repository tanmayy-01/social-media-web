export const validate = (schema) => {
    return async (req, res, next) => {
        try {
            schema.parse(req.body);
            next();
        } catch (error) {
            console.log(error)
            return res.status(400).json({
                success: false,
                message: "Validation Error",
                errors: error.issues || error.message,
            });
        }
    };
};
