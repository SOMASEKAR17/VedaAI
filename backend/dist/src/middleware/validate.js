"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validate = validate;
const zod_1 = require("zod");
const errorHandler_1 = require("./errorHandler");
function validate(schema) {
    return (req, _res, next) => {
        try {
            const parsed = schema.parse(req.body);
            req.body = parsed;
            next();
        }
        catch (error) {
            if (error instanceof zod_1.ZodError) {
                const messages = error.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join('; ');
                next(new errorHandler_1.AppError(`Validation failed: ${messages}`, 400));
            }
            else {
                next(error);
            }
        }
    };
}
//# sourceMappingURL=validate.js.map