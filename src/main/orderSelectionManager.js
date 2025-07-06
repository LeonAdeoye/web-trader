const selectedOrder = {}
const selectedOrdersMap = new Map();

const setSelectedOrder = (orderId, orderStatus) =>
{
    selectedOrder["orderId"] = orderId;
    selectedOrder["orderStatus"] = orderStatus;
}

const setSelectedOrders = (orders) =>
{
    if (Array.isArray(orders) && orders.length > 0)
    {
        selectedOrdersMap.clear();
        orders.forEach(order => {
            selectedOrdersMap.set(order.orderId, order);
        });
    }
    setSelectedOrder(orders[0].orderId, orders[0].orderStatus);
}

const getSelectedOrder = () =>
{
    return selectedOrder;
}

const getSelectedOrders = () =>
{
    return Array.from(selectedOrdersMap.values()).map(order => ({
        orderId: order.orderId,
        orderStatus: order.orderStatus
    }));
}

const clearSelectedOrder = () =>
{
    selectedOrder["orderId"] = "";
    selectedOrder["orderStatus"] = "";
}

const clearSelectedOrders = () =>
{
    selectedOrdersMap.clear();
    clearSelectedOrder();
}

module.exports = {
    setSelectedOrder,
    setSelectedOrders,
    getSelectedOrder,
    clearSelectedOrder,
    clearSelectedOrders,
    getSelectedOrders
}
