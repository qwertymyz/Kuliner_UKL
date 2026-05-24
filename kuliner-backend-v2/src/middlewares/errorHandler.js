// src/middlewares/errorHandler.js
const { errorResponse } = require("../utils/response");

const errorHandler = (err, req, res, next) => {
  console.error(`[ERROR] ${req.method} ${req.url} →`, err.message);

  if (err.code === "P2025") return errorResponse(res, "Data tidak ditemukan", 404);
  if (err.code === "P2002") return errorResponse(res, "Data sudah ada (duplikat)", 409);
  if (err.code === "P2003") return errorResponse(res, "Data terkait tidak ditemukan", 400);
  if (err.statusCode)       return errorResponse(res, err.message, err.statusCode);

  return errorResponse(res, "Internal Server Error", 500);
};

module.exports = errorHandler;
