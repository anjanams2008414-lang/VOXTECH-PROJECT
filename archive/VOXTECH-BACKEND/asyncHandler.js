// Wraps an async Express route/controller so thrown errors reach errorHandler
// instead of crashing the process or hanging the request.
export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};
