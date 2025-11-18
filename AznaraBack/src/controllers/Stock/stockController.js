const { Product, StockMovement, Image, sequelize } = require('../../data');
const response = require('../../utils/response');
const { Op } = require('sequelize');

const stockController = {
    // Agregar stock a un producto
    addStock: async (req, res) => {
        try {
            const { id } = req.params;
            const { quantity, reason, performed_by, notes } = req.body;

            if (!quantity || quantity <= 0) {
                return response(res, 400, { error: 'La cantidad debe ser mayor a 0' });
            }

            const product = await Product.findByPk(id);
            if (!product) {
                return response(res, 404, { error: 'Producto no encontrado' });
            }

            const previousStock = product.stock || 0;
            const newStock = previousStock + parseInt(quantity);

            // Actualizar stock del producto
            await product.update({ stock: newStock });

            // Registrar movimiento
            const movement = await StockMovement.create({
                id_product: id,
                movement_type: 'entrada',
                quantity: parseInt(quantity),
                previous_stock: previousStock,
                new_stock: newStock,
                reason: reason || 'Entrada de stock',
                performed_by,
                notes
            });

            return response(res, 200, {
                message: 'Stock agregado exitosamente',
                product: {
                    id: product.id_product,
                    name: product.name,
                    previous_stock: previousStock,
                    new_stock: newStock,
                    quantity_added: quantity
                },
                movement
            });

        } catch (error) {
            console.error('Error agregando stock:', error);
            return response(res, 500, { error: error.message });
        }
    },

    // Reducir stock de un producto
    removeStock: async (req, res) => {
        try {
            const { id } = req.params;
            const { quantity, reason, performed_by, notes, reference_id } = req.body;

            if (!quantity || quantity <= 0) {
                return response(res, 400, { error: 'La cantidad debe ser mayor a 0' });
            }

            const product = await Product.findByPk(id);
            if (!product) {
                return response(res, 404, { error: 'Producto no encontrado' });
            }

            const previousStock = product.stock || 0;
            
            if (previousStock < quantity) {
                return response(res, 400, { 
                    error: 'Stock insuficiente',
                    available: previousStock,
                    requested: quantity
                });
            }

            const newStock = previousStock - parseInt(quantity);

            // Actualizar stock del producto
            await product.update({ stock: newStock });

            // Registrar movimiento
            const movement = await StockMovement.create({
                id_product: id,
                movement_type: reason === 'venta' ? 'venta' : 'salida',
                quantity: -parseInt(quantity),
                previous_stock: previousStock,
                new_stock: newStock,
                reason: reason || 'Salida de stock',
                performed_by,
                reference_id,
                notes
            });

            return response(res, 200, {
                message: 'Stock reducido exitosamente',
                product: {
                    id: product.id_product,
                    name: product.name,
                    previous_stock: previousStock,
                    new_stock: newStock,
                    quantity_removed: quantity
                },
                movement
            });

        } catch (error) {
            console.error('Error reduciendo stock:', error);
            return response(res, 500, { error: error.message });
        }
    },

    // Ajustar stock manualmente
    adjustStock: async (req, res) => {
        try {
            const { id } = req.params;
            const { new_stock, reason, performed_by, notes } = req.body;

            if (new_stock === undefined || new_stock < 0) {
                return response(res, 400, { error: 'El nuevo stock debe ser mayor o igual a 0' });
            }

            const product = await Product.findByPk(id);
            if (!product) {
                return response(res, 404, { error: 'Producto no encontrado' });
            }

            const previousStock = product.stock || 0;
            const difference = parseInt(new_stock) - previousStock;

            // Actualizar stock del producto
            await product.update({ stock: parseInt(new_stock) });

            // Registrar movimiento
            const movement = await StockMovement.create({
                id_product: id,
                movement_type: 'ajuste',
                quantity: difference,
                previous_stock: previousStock,
                new_stock: parseInt(new_stock),
                reason: reason || 'Ajuste manual de stock',
                performed_by,
                notes
            });

            return response(res, 200, {
                message: 'Stock ajustado exitosamente',
                product: {
                    id: product.id_product,
                    name: product.name,
                    previous_stock: previousStock,
                    new_stock: parseInt(new_stock),
                    difference
                },
                movement
            });

        } catch (error) {
            console.error('Error ajustando stock:', error);
            return response(res, 500, { error: error.message });
        }
    },

    // Obtener historial de movimientos de un producto
    getStockHistory: async (req, res) => {
        try {
            const { id } = req.params;
            const { limit = 50, page = 1 } = req.query;

            const product = await Product.findByPk(id);
            if (!product) {
                return response(res, 404, { error: 'Producto no encontrado' });
            }

            const offset = (page - 1) * limit;

            const { count, rows: movements } = await StockMovement.findAndCountAll({
                where: { id_product: id },
                order: [['createdAt', 'DESC']],
                limit: parseInt(limit),
                offset
            });

            return response(res, 200, {
                product: {
                    id: product.id_product,
                    name: product.name,
                    current_stock: product.stock
                },
                movements,
                pagination: {
                    total: count,
                    page: parseInt(page),
                    limit: parseInt(limit),
                    totalPages: Math.ceil(count / limit)
                }
            });

        } catch (error) {
            console.error('Error obteniendo historial:', error);
            return response(res, 500, { error: error.message });
        }
    },

    // Obtener productos con stock bajo
    getLowStockProducts: async (req, res) => {
        try {
            const products = await Product.findAll({
                where: {
                    stock: {
                        [Op.lte]: sequelize.col('min_stock')
                    }
                },
                include: [
                    {
                        model: Image,
                        as: 'Images',
                        limit: 1
                    }
                ],
                order: [['stock', 'ASC']]
            });

            return response(res, 200, {
                count: products.length,
                products
            });

        } catch (error) {
            console.error('Error obteniendo productos con stock bajo:', error);
            return response(res, 500, { error: error.message });
        }
    },

    // Obtener productos sin stock
    getOutOfStockProducts: async (req, res) => {
        try {
            const products = await Product.findAll({
                where: {
                    stock: 0
                },
                include: [
                    {
                        model: Image,
                        as: 'Images',
                        limit: 1
                    }
                ]
            });

            return response(res, 200, {
                count: products.length,
                products
            });

        } catch (error) {
            console.error('Error obteniendo productos sin stock:', error);
            return response(res, 500, { error: error.message });
        }
    }
};

module.exports = stockController;
