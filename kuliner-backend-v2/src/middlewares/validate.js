// src/middlewares/validate.js
const createError = (message, statusCode = 400) => {
  const err = new Error(message);
  err.statusCode = statusCode;
  return err;
};

const validateRequired = (fields) => {
  return (req, res, next) => {
    for (const field of fields) {
      if (req.body[field] === undefined || req.body[field] === null || req.body[field] === "") {
        return next(createError(`Field '${field}' wajib diisi`));
      }
    }
    next();
  };
};

module.exports = { validateRequired, createError };
