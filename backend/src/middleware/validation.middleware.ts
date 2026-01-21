import { body, validationResult, ValidationChain } from 'express-validator';
import { Request, Response, NextFunction } from 'express';
import { CustomError } from './error.middleware';
import { getDatabasePool } from '../database/connection';

export const validate = (validations: ValidationChain[]) => {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    await Promise.all(validations.map(validation => validation.run(req)));

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const errorMessages = errors.array().map(err => ({
        field: err.type === 'field' ? err.path : 'unknown',
        message: err.msg
      }));

      throw new CustomError(`Validation failed: ${errorMessages.map(e => e.message).join(', ')}`, 400);
    }

    next();
  };
};

export const signupValidation = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Valid email address is required')
    .normalizeEmail()
    .toLowerCase()
    .custom(async (value) => {
      const pool = getDatabasePool();
      const result = await pool.query('SELECT id FROM users WHERE email = $1', [value]);
      if (result.rows.length > 0) {
        throw new Error('This email is already registered');
      }
      return true;
    })
    .withMessage('This email is already registered'),
  body('firstName')
    .trim()
    .notEmpty()
    .withMessage('First name is required')
    .isLength({ min: 1, max: 50 })
    .withMessage('First name must be between 1 and 50 characters'),
  body('lastName')
    .trim()
    .notEmpty()
    .withMessage('Last name is required')
    .isLength({ min: 1, max: 50 })
    .withMessage('Last name must be between 1 and 50 characters'),
  body('username')
    .trim()
    .isLength({ min: 3, max: 30 })
    .withMessage('Username must be between 3 and 30 characters')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username can only contain letters, numbers, and underscores'),
  body('password')
    .isLength({ min: 8, max: 128 })
    .withMessage('Password must be between 8 and 128 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character (@$!%*?&)')
];

export const loginValidation = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Valid email address is required')
    .normalizeEmail()
    .toLowerCase(),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

export const ratingValidation = [
  body('musicItemId')
    .isUUID()
    .withMessage('Valid music item ID is required'),
  body('rating')
    .isInt({ min: 1, max: 10 })
    .withMessage('Rating must be between 1 and 10'),
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),
  body('tags.*')
    .optional()
    .isString()
    .withMessage('Each tag must be a string')
];

export const postValidation = [
  body('musicItemId')
    .isUUID()
    .withMessage('Valid music item ID is required'),
  body('rating')
    .isInt({ min: 1, max: 10 })
    .withMessage('Rating must be between 1 and 10'),
  body('text')
    .optional()
    .isString()
    .isLength({ max: 500 })
    .withMessage('Post text must be 500 characters or less')
];

export const createPostWithMusicItemValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Music item name is required')
    .isLength({ min: 1, max: 200 })
    .withMessage('Music item name must be between 1 and 200 characters'),
  body('category')
    .isIn(['album', 'song', 'artist'])
    .withMessage('Category must be album, song, or artist'),
  body('rating')
    .isInt({ min: 1, max: 10 })
    .withMessage('Rating must be between 1 and 10'),
  body('text')
    .optional()
    .isString()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Post text must be 500 characters or less')
];
