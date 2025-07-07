const selectedOrder = {}

const setSelectedOrder = (order) =>
{
    selectedOrder.orderId = order.orderId;
    selectedOrder.orderState = order.orderState;
};

const getSelectedOrder = () =>
{
    return selectedOrder;
}

const clearSelectedOrder = () =>
{
    selectedOrder.orderId = "";
    selectedOrder.orderState = "";
}

module.exports = {
    setSelectedOrder,
    getSelectedOrder,
    clearSelectedOrder,
}
