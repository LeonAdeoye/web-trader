const selectedOrder = {}
const selectedOrdersMap = new Map();

const setSelectedOrder = (order) =>
{
    selectedOrder.orderId = order.orderId;
    selectedOrder.orderState = order.orderState;
    selectedOrdersMap.set(order.orderId, order);
};


const setSelectedOrders = (orders) =>
{
    if (Array.isArray(orders) && orders.length > 0)
    {
        selectedOrder.orderId = orders[0].orderId;
        selectedOrder.orderState = orders[0].orderState;
        selectedOrdersMap.clear();
        orders.forEach(order => {
            selectedOrdersMap.set(order.orderId, order);
        });
    }
}

const getSelectedOrder = () =>
{
    return selectedOrder;
}

const getSelectedOrders = () =>
{
    return Array.from(selectedOrdersMap.values()).map(order =>
    ({
        orderId: order.orderId,
        orderState: order.orderState
    }));
}

const clearSelectedOrder = () =>
{
    selectedOrder.orderId = "";
    selectedOrder.orderState = "";
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
