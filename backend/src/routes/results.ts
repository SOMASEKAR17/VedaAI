import { Router } from 'express';
import { getResultByAssignmentId, generateResultPDF } from '../controllers/resultController';

const router = Router();

router.get('/:assignmentId', getResultByAssignmentId);

router.post('/:assignmentId/pdf', generateResultPDF);

export default router;
