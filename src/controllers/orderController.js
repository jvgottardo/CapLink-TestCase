import prisma from "../config/db.js";

export const orderController = {
  // Processar checkout e criar order
  async checkout(req, res) {
  try {
    const userId = req.user.userId;

    // Pegar o carrinho com os produtos
    const cart = await prisma.cart.findUnique({
      where: { user_id: userId },
      include: {
        cart_items: {
          include: { products: true }
        }
      }
    });

    if (!cart || cart.cart_items.length === 0) {
      return res.status(400).json({ error: 'Carrinho vazio' });
    }

    // Validar estoque
    for (const item of cart.cart_items) {
      if (item.quantity > item.products.quantity) {
        return res.status(400).json({ 
          error: `Produto ${item.products.name} possui apenas ${item.products.quantity} em estoque` 
        });
      }
    }

    // Calcular total
    const total = cart.cart_items.reduce((sum, item) => {
      return sum + Number(item.products.price) * item.quantity;
    }, 0);

    //  Criar o pedido
    const order = await prisma.orders.create({
      data: {
        user_id: userId,
        total: total
      }
    });

    //  Criar itens do pedido
    const orderItemsData = cart.cart_items.map(item => ({
      order_id: order.order_id,
      product_id: item.product_id,
      quantity: item.quantity,
      price: item.products.price
    }));

    await prisma.order_items.createMany({
      data: orderItemsData
    });

      // Atualizar estoque dos produtos
    for (const item of cart.cart_items) {
      await prisma.products.update({
        where: { product_id: item.product_id },
        data: { quantity: item.products.quantity - item.quantity }
      });
    }

    //  Limpar carrinho
    await prisma.cart_items.deleteMany({
      where: { cart_id: cart.cart_id }
    });

    res.status(201).json({ message: 'Pedido criado com sucesso', order_id: order.order_id });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao processar pedido' });
  }
},

//pegar os items do order para mostrar no historio
async getOrders(req, res) {
  try {
    const userId = req.user.userId;

    // Paginação
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const skip = (page - 1) * limit;

    // Busca paginada
    const [orders, total] = await Promise.all([
      prisma.orders.findMany({
        where: { user_id: userId },
        orderBy: { created_at: 'desc' },
        skip,
        take: limit,
        include: {
          order_items: {
            include: {
              products: {
                select: {
                  product_id: true,
                  name: true,
                  description: true,
                  price: true,
                  image_url: true,
                  category: true,
                  brand: true,
                  quantity: true,
                }
              }
            }
          }
        }
      }),
      prisma.orders.count({ where: { user_id: userId } })
    ]);

    // Formata os pedidos
    const formattedOrders = orders.map(order => ({
      order_id: order.order_id,
      total: order.total,
      created_at: order.created_at,
      items: order.order_items.map(item => ({
        product_id: item.product_id,
        name: item.products.name,
        description: item.products.description,
        price: item.price, // preço do item no momento da compra
        quantity: item.quantity,
        image_url: item.products.image_url,
      }))
    }));

    // Caso não haja pedidos
    if (!formattedOrders.length) {
      return res.json({
        message: 'Nenhum pedido encontrado',
        page,
        limit,
        total: 0,
        totalPages: 0,
        orders: []
      });
    }

    // Retorna resultado paginado
    res.json({
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      orders: formattedOrders
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao buscar pedidos' });
  }
},


//pegar uma order especifica
async getOrderDetails(req, res) {
  try {
    const userId = req.user.userId;
    const { orderId } = req.params;
    const order = await prisma.orders.findFirst({
      where: {
        order_id: Number(orderId),
        user_id: userId
      },
      include: {
        order_items: {
          include: {
            products: {
              select: {
                product_id: true,
                name: true,
                description: true,
                price: true,
                image_url: true,
                category: true,
                brand: true,
                quantity: true,
              }
            }
          }
        }
      }
    });
    if (!order) {
      return res.status(404).json({ error: 'Pedido não encontrado' });
    }
    const formattedOrder = {
      order_id: order.order_id,
      total: order.total,
      created_at: order.created_at,
      items: order.order_items.map(item => ({
        product_id: item.product_id,
        name: item.products.name,
        description: item.products.description,
        price: item.price, // valor do item na hora da compra
        quantity: item.quantity,
        brand: item.products.brand,
        category: item.products.category,
        image_url: item.products.image_url,
      }))
    };
    res.json({ order: formattedOrder });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao buscar detalhes do pedido' });
  }
},


  
}

