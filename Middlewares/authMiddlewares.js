import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const authMiddleware = (req, res, next) => {
  // Pegando o token do cabeçalho Authorization
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ message: 'Token não fornecido' });
  }

  // O token vem no formato 'Bearer token', então dividimos a string
  const token = authHeader.split(' ')[1];

  // Verificando se o token foi enviado corretamente
  if (!token) {
    return res.status(401).json({ message: 'Token mal formatado' });
  }

  // Verificando a validade do token
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: 'Token inválido' });
    }

    // Se o token for válido, adicionamos o usuário decodificado à requisição
    req.user = decoded;

    next();
  });
};

export default authMiddleware;