import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export async function authenticate(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ message: 'Token required' });
  const token = auth.split(' ')[1];
  try {
    const { userId } = jwt.verify(token, process.env.JWT_SECRET);
    
    const user = await User.findById(userId);
    if (!user || !user.isActive) throw new Error();
    req.user = user;
    next();
  } catch {
    res.status(403).json({ message: 'Invalid or expired token' });
  }
}
