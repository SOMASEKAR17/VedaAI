import { Request, Response, NextFunction } from 'express';
export declare function createAssignment(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function getAllAssignments(_req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function getAssignmentById(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function getAssignmentStatus(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function deleteAssignment(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function regenerateAssignment(req: Request, res: Response, next: NextFunction): Promise<void>;
//# sourceMappingURL=assignmentController.d.ts.map