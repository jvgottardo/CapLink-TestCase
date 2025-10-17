// src/controllers/dashboardController.js
import prisma from '../config/db.js';

export const dashboardController = {
  
async getVendorDashboard(req, res) {
  const vendorId = req.user.userId;

  try {
    // Buscar todos os order_items do vendor
    const orderItems = await prisma.order_items.findMany({
      where: { products: { vendor_id: vendorId } },
      select: {
        price: true,
        quantity: true,
      },
    });

    // Total de produtos vendidos
    const totalSold = orderItems.reduce((acc, item) => acc + item.quantity, 0);

    // Faturamento total (price * quantity)
    const totalRevenue = orderItems.reduce((acc, item) => acc + Number(item.price) * item.quantity, 0);

    // Quantidade de produtos cadastrados
    const productCount = await prisma.products.count({
      where: { vendor_id: vendorId },
    });

    // Produto mais vendido
    const bestSelling = await prisma.order_items.groupBy({
      by: ['product_id'],
      _sum: { quantity: true },
      where: { products: { vendor_id: vendorId } },
      orderBy: { _sum: { quantity: 'desc' } },
      take: 1,
    });

    let bestProduct = null;
    if (bestSelling.length > 0) {
      bestProduct = await prisma.products.findUnique({
        where: { product_id: bestSelling[0].product_id },
        select: { name: true, price: true },
      });
    }

    res.json({
      totalSold,
      totalRevenue,
      productCount,
      bestProduct: bestProduct || null,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao buscar dados do dashboard' });
  }
}

};
