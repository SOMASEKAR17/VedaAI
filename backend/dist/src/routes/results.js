"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const resultController_1 = require("../controllers/resultController");
const router = (0, express_1.Router)();
router.get('/:assignmentId', resultController_1.getResultByAssignmentId);
router.post('/:assignmentId/pdf', resultController_1.generateResultPDF);
exports.default = router;
//# sourceMappingURL=results.js.map