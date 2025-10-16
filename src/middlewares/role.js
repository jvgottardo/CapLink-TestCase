export function authorizeRoles(...rolesPermitidas) {
  return (req, res, next) => {
    if (!rolesPermitidas.includes(req.user.role)) {
      return res.status(403).json({ error: 'Acesso negado' });
    }
    next();
  };
}
