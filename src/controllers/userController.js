import prisma from '../config/db.js';
import bcrypt from 'bcrypt';
import { signToken } from '../utils/token.js';

const SALT_ROUNDS = parseInt(process.env.BCRYPT_SALT_ROUNDS || '10', 10);

export const userController = {
  //cadastrar usuario
  async signup(req, res) {
    try {
      const { name, email, password, role } = req.body;
      if (!name || !email || !password) {
        return res.status(400).json({ error: 'Campos obrigatórios ausentes' });
      }

      const existing = await prisma.users.findUnique({ where: { email } });
      if (existing)
        return res.status(409).json({ error: 'Email já cadastrado' });

      const hashed = await bcrypt.hash(password, SALT_ROUNDS);
      const user = await prisma.users.create({
        data: { name, email, password: hashed, role },
      });

      const token = signToken(user);
      res.status(201).json({ user: { id: user.id, name, email, role }, token });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Erro no servidor' });
    }
  },

  //logar usuario
  async login(req, res) {
    try {
      const { email, password } = req.body;
      const user = await prisma.users.findUnique({ where: { email } });
      if (!user)
        return res.status(401).json({ error: 'Credenciais inválidas' });

      const match = await bcrypt.compare(password, user.password);
      if (!match) return res.status(401).json({ error: 'Senha incorreta' });

      const token = signToken(user);
      res.json({
        token,
        user: { id: user.id, name: user.name, email, role: user.role },
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Erro no servidor' });
    }
  },

  //pegar infos do perfil
  async getProfile(req, res) {
    try {
      const user = await prisma.users.findUnique({
        where: { user_id: req.user.userId },
        select: {
          user_id: true,
          name: true,
          email: true,
          role: true,
          active: true,
        },
      });
      res.json({ user });
    } catch (error) {
      res.status(500).json({ error: 'Erro no servidor' });
    }
  },

  //editar usuario
  async editProfile(req, res) {
    try {
      const { name, email, password } = req.body;
      const updates = {};

      if (name) updates.name = name;
      if (email) updates.email = email;
      if (password) updates.password = await bcrypt.hash(password, SALT_ROUNDS);

      const updatedUser = await prisma.users.update({
        where: { user_id: req.user.userId },
        data: updates,
        select: { user_id: true, name: true, email: true, role: true },
      });

      res.json({ user: updatedUser });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Erro no servidor' });
    }
  },

  //desativar usuario
  async deleteProfile(req, res) {
    try {
      const userId = req.user.userId;

      const existingUser = await prisma.users.findUnique({
        where: { user_id: userId },
      });

      if (!existingUser) {
        return res.status(404).json({ error: 'Usuário não encontrado' });
      }

      // Desativar conta e anonimizar e-mail
      if (existingUser.role === 'client') {
        // Cliente: desativar e anonimizar
        const anonymizedEmail = `deleted_${userId}_${Date.now()}@example.com`;
        await prisma.users.update({
          where: { user_id: userId },
          data: {
            active: false,
            email: anonymizedEmail,
            name: 'Usuário deletado',
          },
        });
      } else if (existingUser.role === 'vendor') {
        // Vendedor: apenas desativar e ocultar produtos
        await prisma.users.update({
          where: { user_id: userId },
          data: { active: false },
        });
        await prisma.products.updateMany({
          where: { vendor_id: userId },
          data: { active: false },
        });
      }

      res.json({ message: 'Conta desativada com sucesso' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Erro no servidor' });
    }
  },

  //reativar a conta

  async reactiveUser(req, res) {
    try {
      const userId = req.user.userId;

      const existingUser = await prisma.users.findUnique({
        where: { user_id: userId },
      });

      if (!existingUser) {
        return res.status(404).json({ error: 'Usuário não encontrado' });
      }

      await prisma.users.update({
        where: { user_id: userId },
        data: { active: true },
      });

      // await prisma.products.updateMany({
      //   where: { vendor_id: userId },
      //   data: { active: true },
      // });

      res.json({ message: 'Conta reativada com sucesso' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Erro no servidor' });
    }
  },

  //list vendors 
  async getVendors(req, res) {
    try {
      const vendors = await prisma.users.findMany({
        where: { role: "vendor", active: true },
        select: {
          user_id: true,
          name: true,
        },
        orderBy: { name: "asc" },
      });

      res.json({ vendors });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Erro ao buscar vendedores" });
    }
  },
};
