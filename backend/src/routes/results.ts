import { Router } from 'express';
import { getResultByAssignmentId, generateResultPDF } from '../controllers/resultController';

const router = Router();

// GET /api/results/:assignmentId - Get result for an assignment
router.get('/:assignmentId', getResultByAssignmentId);

// POST /api/results/:assignmentId/pdf - Generate and download PDF
router.post('/:assignmentId/pdf', generateResultPDF);

export default router;
