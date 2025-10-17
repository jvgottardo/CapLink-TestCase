// src/controllers/dashboardController.js
import prisma from '../config/db.js';

export const dashboardController = {
  async getVendorDashboard(req, res) {
    const vendorId = req.user.id;

  try {
    // Total de produtos vendidos
    const totalSold = await prisma.order_items.aggregate({
      _sum: { quantity: true },
      where: { product: { vendor_id: vendorId } },
    });

    // Faturamento total
    const totalRevenue = await prisma.order_items.aggregate({
      _sum: { price: true },
      where: { product: { vendor_id: vendorId } },
    });

    // Quantidade de produtos cadastrados
    const productCount = await prisma.products.count({
      where: { vendor_id: vendorId },
    });

    // Produto mais vendido
    const bestSelling = await prisma.order_items.groupBy({
      by: ['product_id'],
      _sum: { quantity: true },
      where: { product: { vendor_id: vendorId } },
      orderBy: { _sum: { quantity: 'desc' } },
      take: 1,
    });

    const bestProduct = bestSelling.length
      ? await prisma.products.findUnique({
          where: { product_id: bestSelling[0].product_id },
          select: { name: true, price: true },
        })
      : null;

    res.json({
      totalSold: totalSold._sum.quantity || 0,
      totalRevenue: totalRevenue._sum.price || 0,
      productCount,
      bestProduct,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao buscar dados do dashboard' });
  }
},
};
