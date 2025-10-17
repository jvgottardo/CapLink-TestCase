import prisma from '../config/db.js';

export const productController = {
  //listar produtos
  async getProducts(req, res) {
  try {
    // Paginação
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Filtros dinâmicos
    const { search, category, minPrice, maxPrice, active } = req.query;

    // Monta o objeto "where" dinamicamente
    const where = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { brand: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (category) where.category = category;
    if (active !== undefined) where.active = active === 'true';
    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = parseFloat(minPrice);
      if (maxPrice) where.price.lte = parseFloat(maxPrice);
    }

    // Busca + paginação
    const [products, total] = await Promise.all([
      prisma.products.findMany({
        where,
        skip,
        take: limit,
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
        orderBy: { created_at: 'desc' },
      }),

      prisma.products.count({ where }),
    ]);

    res.json({
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      filters: { search, category, minPrice, maxPrice, active },
      products,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro no servidor' });
  }
},


  //listar produtos ativos
  async getProductsActive(req, res) {
    try {
      const products = await prisma.products.findMany({
        where: { active: true },
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
            // o relacionamento com o vendedor
            select: {
              user_id: true,
              name: true,
            },
          },
        },
        orderBy: { created_at: 'desc' }, // opcional: mostrar os mais recentes primeiro
      });

      res.json({ products });
    } catch (error) {
      res.status(500).json({ error: 'Erro no servidor' });
    }
  },

  //listar produto por id
  async getProductById(req, res) {
    try {
      const productId = parseInt(req.params.product_id); // pega o id da URL
      if (isNaN(productId)) {
        return res.status(400).json({ error: 'ID inválido' });
      }

      const product = await prisma.products.findUnique({
        where: { product_id: productId },
        include: {
          users: {
            // o relacionamento com o vendedor
            select: {
              user_id: true,
              name: true,
              email: true,
              role: true,
              created_at: true,
            },
          },
        },
      });

      if (!product || product.active === false) {
        return res.status(404).json({ error: 'Produto não encontrado' });
      }

      res.json({ product });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Erro no servidor' });
    }
  },

  //cadastrar produto
  async addProduct(req, res) {
    try {
      const { name, description, price, brand, quantity, category } = req.body;

      if (!name || !price) {
        return res.status(400).json({ error: 'Nome e preço são obrigatórios' });
      }

      const image_url = req.file ? `/uploads/${req.file.filename}` : null;

      const vendorId = req.user?.userId;
      if (!vendorId) {
        return res.status(401).json({ error: 'Usuário não autenticado' });
      }
      const vendor = req.user?.role;
      if (vendor !== 'vendor') {
        return res
          .status(403)
          .json({ error: 'Apenas vendedores podem adicionar produtos' });
      }

      const newProduct = await prisma.products.create({
        data: {
          vendor_id: vendorId,
          name,
          description,
          price: parseFloat(price),
          image_url,
          active: true,
          brand: brand || null,
          quantity: quantity ? parseInt(quantity) : 0,
          category: category || null,
        },
      });
      res
        .status(201)
        .json({ message: 'Produto criado com sucesso', product: newProduct });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Erro no servidor' });
    }
  },

  async getProductsByUser(req, res) {
  try {
    const userId = req.user.userId; // ID do vendedor logado

    // parâmetros de paginação
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // total de produtos do vendedor
    const totalProducts = await prisma.products.count({
      where: { users_id: userId },
    });

    // buscar produtos do vendedor com paginação
    const products = await prisma.products.findMany({
      where: { user_id: userId },
      orderBy: { created_at: 'desc' },
      skip,
      take: limit,
      select: {
        product_id: true,
        name: true,
        description: true,
        price: true,
        image_url: true,
        category: true,
        brand: true,
        quantity: true,
        published_at: true,
        active: true,
        created_at: true,
      },
    });

    res.json({
      total: totalProducts,
      page,
      totalPages: Math.ceil(totalProducts / limit),
      products,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro no servidor ao buscar produtos do vendedor' });
  }
},


  //cadastrar produto via csv
  async addProductsViaCSV(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'Arquivo CSV é obrigatório' });
      }
      const vendorId = req.user?.userId;
      if (!vendorId) {
        return res.status(401).json({ error: 'Usuário não autenticado' });
      }
      const vendor = req.user?.role;
      if (vendor !== 'vendor') {
        return res
          .status(403)
          .json({ error: 'Apenas vendedores podem adicionar produtos' });
      }

      const fs = await import('fs');
      const csv = await import('csv-parser');
      const results = [];

      fs.createReadStream(req.file.path)
        .pipe(csv.default())
        .on('data', (data) => results.push(data))
        .on('end', async () => {
          const productsToCreate = results.map((row) => ({
            vendor_id: vendorId,
            name: row.name,
            description: row.description || '',
            price: parseFloat(row.price),
            image_url: row.image_url || null,
            active: row.active ? row.active.toLowerCase() === 'true' : true,
            brand: row.brand || null,
            quantity: row.quantity ? parseInt(row.quantity) : 0,
            category: row.category || null,
          }));
          try {
            const createdProducts = await prisma.products.createMany({
              data: productsToCreate,
              skipDuplicates: true,
            });
            fs.unlink
              ? fs.unlink(req.file.path, (err) => {
                  if (err) console.error('Erro ao deletar o arquivo:', err);
                })
              : null;
            res.status(201).json({
              message: 'Produtos criados com sucesso',
              count: createdProducts.count,
            });
          } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Erro ao criar produtos' });
          }
        });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Erro no servidor' });
    }
  },

  //editar produto
  async editProduct(req, res) {
    try {
      const productId = parseInt(req.params.product_id);
      const { name, description, price, brand, quantity, category } = req.body;
      console.log(req.body);

      if (isNaN(productId)) {
        return res.status(400).json({ error: 'ID inválido' });
      }
      const product = await prisma.products.findUnique({
        where: { product_id: productId },
      });
      if (!product) {
        return res.status(404).json({ error: 'Produto não encontrado' });
      }
      if (product.vendor_id !== req.user.userId) {
        return res
          .status(403)
          .json({ error: 'Você não tem permissão para editar este produto' });
      }

      const image_url = req.file
        ? `/uploads/${req.file.filename}`
        : product.image_url;

      const updatedProduct = await prisma.products.update({
        where: { product_id: productId },
        data: {
          name: name || product.name,
          description: description || product.description,
          price: price ? parseFloat(price) : product.price,
          image_url: image_url || product.image_url,
          brand: brand || product.brand,
          quantity:
            quantity !== undefined ? parseInt(quantity) : product.quantity,
          category: category || product.category,
        },
      });
      res.json({
        message: 'Produto atualizado com sucesso',
        product: updatedProduct,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Erro no servidor' });
    }
  },

  //delete produto
  async deleteProduct(req, res) {
    try {
      const { product_id } = req.body;
      const productId = parseInt(product_id);
      if (isNaN(productId)) {
        return res.status(400).json({ error: 'ID inválido' });
      }
      const product = await prisma.products.findUnique({
        where: { product_id: productId },
      });
      if (!product) {
        return res.status(404).json({ error: 'Produto não encontrado' });
      }
      if (product.vendor_id !== req.user.userId) {
        return res
          .status(403)
          .json({ error: 'Você não tem permissão para deletar este produto' });
      }
      await prisma.products.delete({
        where: { product_id: productId },
      });
      res.json({ message: 'Produto deletado com sucesso' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Erro no servidor' });
    }
  },

  //desativar produto
  async deactivateProduct(req, res) {
    try {
      const { product_id } = req.body;
      const productId = parseInt(product_id);
      if (isNaN(productId)) {
        return res.status(400).json({ error: 'ID inválido' });
      }
      const product = await prisma.products.findUnique({
        where: { product_id: productId },
      });
      if (!product) {
        return res.status(404).json({ error: 'Produto não encontrado' });
      }
      if (product.vendor_id !== req.user.userId) {
        return res.status(403).json({
          error: 'Você não tem permissão para desativar este produto',
        });
      }
      await prisma.products.update({
        where: { product_id: productId },
        data: { active: false },
      });
      res.json({ message: 'Produto desativado com sucesso' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Erro no servidor' });
    }
  },

  //ativar produto
  async activateProduct(req, res) {
    try {
      const { product_id } = req.body;
      const productId = parseInt(product_id);
      if (isNaN(productId)) {
        return res.status(400).json({ error: 'ID inválido' });
      }
      const product = await prisma.products.findUnique({
        where: { product_id: productId },
      });
      if (!product) {
        return res.status(404).json({ error: 'Produto não encontrado' });
      }
      if (product.vendor_id !== req.user.userId) {
        return res
          .status(403)
          .json({ error: 'Você não tem permissão para ativar este produto' });
      }
      await prisma.products.update({
        where: { product_id: productId },
        data: { active: true },
      });
      res.json({ message: 'Produto ativado com sucesso' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Erro no servidor' });
    }
  },
};
