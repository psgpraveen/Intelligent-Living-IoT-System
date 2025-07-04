export default function errorHandler(err, req, res, next) {
  console.error(err);
  const msg = err.code === 11000
    ? 'Duplicate key error'
    : err.message || 'Server error';
  res.status(err.statusCode || 500).json({ message: msg });
}
