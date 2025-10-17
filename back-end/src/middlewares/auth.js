import { verifyToken } from '../utils/token.js';

export function authenticate(req, res, next) {
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ error: 'Token não enviado' });

  const token = header;
  try {
    const decoded = verifyToken(token);
    req.user = decoded;
    next(); // deixa seguir para o controller
  } catch (error) {
    return res.status(401).json({ error: 'Token inválido ou expirado' });
  }
}
