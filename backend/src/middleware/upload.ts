import multer, { FileFilterCallback } from 'multer';
import { Request, Response, NextFunction } from 'express';
import pdfParse from 'pdf-parse';
import { env } from '../config/env';
import { AppError } from './errorHandler';

const ALLOWED_MIMES = ['application/pdf', 'text/plain'];

const storage = multer.memoryStorage();

const fileFilter = (
  _req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback
): void => {
  if (ALLOWED_MIMES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new AppError('Invalid file type. Only PDF and TXT files are allowed.', 400));
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: env.MAX_FILE_SIZE_MB * 1024 * 1024,
  },
});

export async function extractFileText(
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.file) {
      next();
      return;
    }

    const { mimetype, buffer } = req.file;

    if (mimetype === 'application/pdf') {
      const pdfData = await pdfParse(buffer);
      req.body.uploadedFileText = pdfData.text;
    } else if (mimetype === 'text/plain') {
      req.body.uploadedFileText = buffer.toString('utf-8');
    }

    next();
  } catch (error) {
    next(new AppError('Failed to extract text from uploaded file', 400));
  }
}
