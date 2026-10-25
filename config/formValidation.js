const { body } = require('express-validator');

const validateSignUp = [
    body('username')
        .trim()
        .notEmpty().withMessage('Username is required')
        .isLength({ min: 3 }).withMessage('Username must be at least 3 characters long')
        .isAlphanumeric().withMessage('Username must contain only letters and numbers'),
    body('email')
        .trim()
        .notEmpty().withMessage('Email is required')
        .isEmail().withMessage('Please provide a valid email address'),
    body('password')
        .trim()
        .notEmpty().withMessage('Password is required')
        .isLength({ min: 8 }).withMessage('Password must be at least 8 characters long'),
    body('confirmPassword')
        .trim()
        .notEmpty().withMessage('Confirm Password is required')
        .custom((value, { req }) => {
            if (value !== req.body.password) {
                throw new Error('Passwords do not match');
            }
            return true;
        })
]

const validateLogin= [
    body('username')
        .trim()
        .notEmpty().withMessage('Username is required'),
    body('password')
        .trim()
        .notEmpty().withMessage('Password is required')
        .isLength({ min: 8 }).withMessage('Password must be at least 8 characters long')
]

const validateCreateFolder = [
    body( 'newFolder' )
        .trim()
        .isAlphanumeric().withMessage( 'Folder name must be alphanumeric without spaces')
        .notEmpty().withMessage( 'Enter a valid folder name' )
        .isLength({ min: 3}).withMessage( 'Folder name must be at least 3 characters long' )
]

module.exports = { validateSignUp, validateLogin, validateCreateFolder };