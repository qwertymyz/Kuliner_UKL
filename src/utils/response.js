// src/utils/response.js
const successResponse = (res, data, message = "Berhasil", statusCode = 200) => {
  return res.status(statusCode).json({ success: true, message, data });
};

const errorResponse = (res, message = "Terjadi kesalahan", statusCode = 500) => {
  return res.status(statusCode).json({ success: false, message, data: null });
};

module.exports = { successResponse, errorResponse };
