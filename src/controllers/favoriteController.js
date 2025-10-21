import prisma from '../config/db.js';

export const favoriteController = {
  //listar favoritos
 async getFavorites(req, res) {
  try {
    const userId = req.user.userId;

    // parâmetros de paginação (com valores padrão)
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // total de favoritos do usuário
    const totalFavorites = await prisma.favorites.count({
      where: { user_id: userId },
    });

    const favorites = await prisma.favorites.findMany({
      where: { user_id: userId },
      select: {
        favorite_id: true,
        user_id: true,
        product_id: true,
        products: {
          select: {
            product_id: true,
            name: true,
            description: true,
            price: true,
            image_url: true,
            published_at: true,
            active: true,
            brand: true,
            quantity: true,
            category: true,
            users: {
              select: {
                user_id: true,
                name: true,
              },
            },
          },
        },
      },
      orderBy: { created_at: 'desc' },
      skip,
      take: limit,
    });

    res.json({
      total: totalFavorites,
      page,
      totalPages: Math.ceil(totalFavorites / limit),
      favorites,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro no servidor ao buscar favoritos' });
  }
},

  //cadastrar lista de favoritos
  async addFavorite(req, res) {
    try {
      const { product_id } = req.body;

      const userId = req.user.userId;
      if (!product_id) {
        return res.status(400).json({ error: 'ID do produto é obrigatório' });
      }
      // Verificar se o produto existe
      const existingProduct = await prisma.products.findUnique({
        where: { product_id: product_id },
      });
      if (!existingProduct) {
        return res.status(404).json({ error: 'Produto não encontrado' });
      }
      // Verificar se o favorito já existe para o usuário e produto
      const existingFavorite = await prisma.favorites.findFirst({
        where: {
          user_id: userId,
          product_id: product_id,
        },
      });
      if (existingFavorite) {
        return res.status(400).json({ error: 'Produto já está nos favoritos' });
      }
      // Criar o favorito
      const newFavorite = await prisma.favorites.create({
        data: {
          user_id: userId,
          product_id: product_id,
        },
      });
      res.status(201).json({ favorite: newFavorite });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Erro no servidor' });
    }
  },

  //deletar do favorito
  async removeFavorite(req, res) {
    try {
      const { favoriteId } = req.body;
      const userId = req.user.userId;

      if (isNaN(favoriteId)) {
        return res.status(400).json({ error: 'ID inválido' });
      }
      // Verificar se o favorito existe e pertence ao usuário
      const existingFavorite = await prisma.favorites.findUnique({
        where: { favorite_id: favoriteId },
      });
      if (!existingFavorite || existingFavorite.user_id !== userId) {
        return res.status(404).json({ error: 'Favorito não encontrado' });
      }
      // Deletar o favorito
      await prisma.favorites.delete({
        where: { favorite_id: favoriteId },
      });
      res.json({ message: 'Favorito removido com sucesso' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Erro no servidor' });
    }
  },
};
