import prisma from '../config/db.js';

export const cartController = {
  //buscar carrinho do usuário
  async getCart(req, res) {
    try {
      const userId = req.user.userId;

      // Verifica se o usuário já tem um carrinho
      let cart = await prisma.cart.findUnique({
        where: { user_id: userId },
        include: {
          cart_items: {
            include: {
              products: {
                select: {
                  product_id: true,
                  name: true,
                  description: true,
                  price: true,
                  image_url: true,
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
          },
        },
      });

      // Se não tiver, cria um carrinho vazio
      if (!cart) {
        cart = await prisma.cart.create({
          data: { user_id: userId },
          include: {
            cart_items: {
              include: {
                products: true,
              },
            },
          },
        });
      }

      const total = cart.cart_items.reduce((sum, item) => {
        return sum + Number(item.products.price) * item.quantity;
      }, 0);

      // Mapeia os itens para devolver um JSON mais limpo
      const formattedCart = {
        cart_id: cart.cart_id,
        user_id: cart.user_id,
        created_at: cart.created_at,
        updated_at: cart.updated_at,
        total: total.toFixed(2),
        items: cart.cart_items.map((item) => ({
          cart_item_id: item.cart_item_id,
          quantity: item.quantity,
          product: item.products,
        })),
      };

      res.json({
        message: cart.cart_items.length
          ? 'Carrinho encontrado'
          : 'Carrinho vazio',
        cart: formattedCart,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Erro no servidor' });
    }
  },

  //adicionar produto ao carrinho
  async addProductCart(req, res) {
    try {
      const { product_id, quantity } = req.body;
      const userId = req.user.userId;

      if (!product_id) {
        return res.status(400).json({ error: 'ID do produto é obrigatório' });
      }

      // Verifica se o produto existe
      const existingProduct = await prisma.products.findUnique({
        where: { product_id: Number(product_id) },
      });

      if (!existingProduct) {
        return res.status(404).json({ error: 'Produto não encontrado' });
      }

      const qtyToAdd = Number(quantity || 1);
      if (qtyToAdd > existingProduct.quantity) {
        return res.status(400) .json({error: 'Quantidade solicitada maior que o estoque disponível'});
      }

      // Verifica se o usuário já tem um carrinho
      let cart = await prisma.cart.findUnique({
        where: { user_id: userId },
      });

      // Se não tiver, cria um novo
      if (!cart) {
        cart = await prisma.cart.create({
          data: {
            user_id: userId,
          },
        });
      }

      // Verifica se o produto já está no carrinho
      const existingCartItem = await prisma.cart_items.findUnique({
        where: {
          cart_id_product_id: {
            cart_id: cart.cart_id,
            product_id: Number(product_id),
          },
        },
      });

      if (existingCartItem) {
        // Se já existe, incrementa a quantidade
        const updatedItem = await prisma.cart_items.update({
          where: {
            cart_id_product_id: {
              cart_id: cart.cart_id,
              product_id: Number(product_id),
            },
          },
          data: {
            quantity: existingCartItem.quantity + Number(quantity),
          },
        });

        return res.status(200).json({
          message: 'Quantidade atualizada no carrinho',
          cartItem: updatedItem,
        });
      }

      // Caso contrário, adiciona o produto ao carrinho
      const newCartItem = await prisma.cart_items.create({
        data: {
          cart_id: cart.cart_id,
          product_id: Number(product_id),
          quantity: Number(quantity),
        },
      });

      res.status(201).json({
        message: 'Produto adicionado ao carrinho com sucesso',
        cartItem: newCartItem,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Erro no servidor' });
    }
  },

  //remover produto do carrinho
  async removeProductCart(req, res) {
    try {
      const { product_id } = req.body;
      const userId = req.user.userId;
      if (!product_id) {
        return res.status(400).json({ error: 'ID do produto é obrigatório' });
      }
      // Verifica se o usuário tem um carrinho
      const cart = await prisma.cart.findUnique({
        where: { user_id: userId },
      });
      if (!cart) {
        return res.status(404).json({ error: 'Carrinho não encontrado' });
      }
      // Verifica se o produto está no carrinho
      const cartItem = await prisma.cart_items.findUnique({
        where: {
          cart_id_product_id: {
            cart_id: cart.cart_id,
            product_id: Number(product_id),
          },
        },
      });
      if (!cartItem) {
        return res
          .status(404)
          .json({ error: 'Produto não encontrado no carrinho' });
      }
      // Remove o produto do carrinho
      await prisma.cart_items.delete({
        where: {
          cart_id_product_id: {
            cart_id: cart.cart_id,
            product_id: Number(product_id),
          },
        },
      });
      res.json({ message: 'Produto removido do carrinho com sucesso' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Erro no servidor' });
    }
  },

  //remover apenas a quantidade do produto no carrinho
  async removeQuantityProductCart(req, res) {
    try {
      const { product_id, quantity } = req.body;
      const userId = req.user.userId;
      if (!product_id || !quantity) {
        return res
          .status(400)
          .json({ error: 'ID do produto e quantidade são obrigatórios' });
      }
      // Verifica se o usuário tem um carrinho
      const cart = await prisma.cart.findUnique({
        where: { user_id: userId },
      });
      if (!cart) {
        return res.status(404).json({ error: 'Carrinho não encontrado' });
      }
      // Verifica se o produto está no carrinho
      const cartItem = await prisma.cart_items.findUnique({
        where: {
          cart_id_product_id: {
            cart_id: cart.cart_id,
            product_id: Number(product_id),
          },
        },
      });
      if (!cartItem) {
        return res
          .status(404)
          .json({ error: 'Produto não encontrado no carrinho' });
      }
      if (cartItem.quantity <= quantity) {
        // Se a quantidade a remover é maior ou igual à existente, remove o item
        await prisma.cart_items.delete({
          where: {
            cart_id_product_id: {
              cart_id: cart.cart_id,
              product_id: Number(product_id),
            },
          },
        });
        return res.json({
          message: 'Produto removido do carrinho com sucesso',
        });
      }
      // Caso contrário, decrementa a quantidade
      const updatedItem = await prisma.cart_items.update({
        where: {
          cart_id_product_id: {
            cart_id: cart.cart_id,
            product_id: Number(product_id),
          },
        },
        data: {
          quantity: cartItem.quantity - Number(quantity),
        },
      });
      res.json({
        message: 'Quantidade do produto atualizada no carrinho com sucesso',
        cartItem: updatedItem,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Erro no servidor' });
    }
  },
};
