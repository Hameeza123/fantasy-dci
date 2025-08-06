const { body, param, query, validationResult } = require('express-validator');

// Handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

// User validation rules
const userValidation = {
  register: [
    body('username')
      .isLength({ min: 3, max: 30 })
      .withMessage('Username must be between 3 and 30 characters')
      .matches(/^[a-zA-Z0-9_]+$/)
      .withMessage('Username can only contain letters, numbers, and underscores'),
    body('email')
      .isEmail()
      .withMessage('Must be a valid email address')
      .normalizeEmail(),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters long'),
    body('firstName')
      .trim()
      .isLength({ min: 1, max: 50 })
      .withMessage('First name is required and must be less than 50 characters'),
    body('lastName')
      .trim()
      .isLength({ min: 1, max: 50 })
      .withMessage('Last name is required and must be less than 50 characters'),
    handleValidationErrors
  ],
  
  login: [
    body('email')
      .isEmail()
      .withMessage('Must be a valid email address')
      .normalizeEmail(),
    body('password')
      .notEmpty()
      .withMessage('Password is required'),
    handleValidationErrors
  ],
  
  update: [
    body('firstName')
      .optional()
      .trim()
      .isLength({ min: 1, max: 50 })
      .withMessage('First name must be less than 50 characters'),
    body('lastName')
      .optional()
      .trim()
      .isLength({ min: 1, max: 50 })
      .withMessage('Last name must be less than 50 characters'),
    body('avatar')
      .optional()
      .isURL()
      .withMessage('Avatar must be a valid URL'),
    handleValidationErrors
  ]
};

// League validation rules
const leagueValidation = {
  create: [
    body('name')
      .trim()
      .isLength({ min: 1, max: 100 })
      .withMessage('League name is required and must be less than 100 characters'),
    body('description')
      .optional()
      .trim()
      .isLength({ max: 500 })
      .withMessage('Description must be less than 500 characters'),
    body('settings.maxMembers')
      .optional()
      .isInt({ min: 2, max: 20 })
      .withMessage('Max members must be between 2 and 20'),
    body('settings.draftOrder')
      .optional()
      .isIn(['snake', 'linear'])
      .withMessage('Draft order must be either snake or linear'),
    handleValidationErrors
  ],
  
  update: [
    body('name')
      .optional()
      .trim()
      .isLength({ min: 1, max: 100 })
      .withMessage('League name must be less than 100 characters'),
    body('description')
      .optional()
      .trim()
      .isLength({ max: 500 })
      .withMessage('Description must be less than 500 characters'),
    handleValidationErrors
  ],
  
  join: [
    body('inviteCode')
      .isLength({ min: 8, max: 8 })
      .withMessage('Invite code must be 8 characters'),
    handleValidationErrors
  ]
};

// Corps validation rules
const corpsValidation = {
  create: [
    body('name')
      .trim()
      .isLength({ min: 1, max: 100 })
      .withMessage('Corps name is required and must be less than 100 characters'),
    body('abbreviation')
      .trim()
      .isLength({ min: 1, max: 5 })
      .withMessage('Abbreviation must be between 1 and 5 characters'),
    body('division')
      .optional()
      .isIn(['World Class', 'Open Class', 'All-Age'])
      .withMessage('Invalid division'),
    body('founded')
      .optional()
      .isInt({ min: 1900, max: new Date().getFullYear() })
      .withMessage('Founded year must be valid'),
    handleValidationErrors
  ],
  
  updateScore: [
    body('section')
      .isIn(['brass', 'percussion', 'guard', 'visual', 'generalEffect'])
      .withMessage('Invalid section'),
    body('score')
      .isFloat({ min: 0, max: 20 })
      .withMessage('Score must be between 0 and 20'),
    body('rank')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Rank must be a positive integer'),
    handleValidationErrors
  ]
};

// Draft validation rules
const draftValidation = {
  makePick: [
    body('corpsId')
      .isMongoId()
      .withMessage('Invalid corps ID'),
    body('section')
      .isIn(['brass', 'percussion', 'guard', 'visual', 'generalEffect'])
      .withMessage('Invalid section'),
    handleValidationErrors
  ],
  
  start: [
    body('timeLimit')
      .optional()
      .isInt({ min: 30, max: 300 })
      .withMessage('Time limit must be between 30 and 300 seconds'),
    body('autoPick')
      .optional()
      .isBoolean()
      .withMessage('Auto-pick must be a boolean'),
    handleValidationErrors
  ]
};

// Team validation rules
const teamValidation = {
  create: [
    body('name')
      .trim()
      .isLength({ min: 1, max: 100 })
      .withMessage('Team name is required and must be less than 100 characters'),
    body('leagueId')
      .isMongoId()
      .withMessage('Invalid league ID'),
    handleValidationErrors
  ]
};

// Parameter validation
const paramValidation = {
  userId: [
    param('userId')
      .isMongoId()
      .withMessage('Invalid user ID'),
    handleValidationErrors
  ],
  
  leagueId: [
    param('leagueId')
      .isMongoId()
      .withMessage('Invalid league ID'),
    handleValidationErrors
  ],
  
  corpsId: [
    param('corpsId')
      .isMongoId()
      .withMessage('Invalid corps ID'),
    handleValidationErrors
  ],
  
  draftId: [
    param('draftId')
      .isMongoId()
      .withMessage('Invalid draft ID'),
    handleValidationErrors
  ],
  
  teamId: [
    param('teamId')
      .isMongoId()
      .withMessage('Invalid team ID'),
    handleValidationErrors
  ]
};

// Query validation
const queryValidation = {
  pagination: [
    query('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Page must be a positive integer'),
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Limit must be between 1 and 100'),
    handleValidationErrors
  ],
  
  search: [
    query('q')
      .optional()
      .trim()
      .isLength({ min: 1, max: 100 })
      .withMessage('Search query must be between 1 and 100 characters'),
    handleValidationErrors
  ]
};

module.exports = {
  userValidation,
  leagueValidation,
  corpsValidation,
  draftValidation,
  teamValidation,
  paramValidation,
  queryValidation,
  handleValidationErrors
}; 