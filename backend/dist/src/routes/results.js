"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const resultController_1 = require("../controllers/resultController");
const router = (0, express_1.Router)();
// GET /api/results/:assignmentId - Get result for an assignment
router.get('/:assignmentId', resultController_1.getResultByAssignmentId);
// POST /api/results/:assignmentId/pdf - Generate and download PDF
router.post('/:assignmentId/pdf', resultController_1.generateResultPDF);
exports.default = router;
//# sourceMappingURL=results.js.map