import React, { Component } from 'react';
import PropTypes from 'prop-types';

class Orders extends Component {
  constructor(props, context) {
    super(props);
    this.contracts = context.drizzle.contracts;
    this.userAccountKey = this.contracts.BlockMarket.methods.users.cacheCall(this.props.accounts[0]);

    this.handleShipBtn = this.handleShipBtn.bind(this);
  }

  handleShipBtn(event) {
    let orderIndex = event.target.value;
    this.contracts.BlockMarket.methods.shipOrder.cacheSend(orderIndex, {from: this.props.accounts[0]});
    this.orderTotal = this.contracts.BlockMarket.methods.getNumberOfOrders.cacheCall();

    event.preventDefault();
  }

  render() {  
    let ordersRows = "";

    // for (let order in this.props.BlockMarket.Orders[this.userAccountKey]) {
    ordersRows = this.props.BlockMarket.Orders[this.userAccountKey].map((order, index) =>
      <tr key={index}>
        <td>{order.orderID}</td>
        <td>{order.sku}</td>
        <td>{order.storeID}</td>
        <td>{order.buyer}</td>
        <td>{order.quantity}</td>
        <td>{order.totalPrice}</td>
        <td>
          <button type="button" value={index} className="btn btn-sm btn-outline-primary" onClick={this.handleShipBtn}>Ship</button>
        </td>
      </tr>
    );

    return (
      <div className="row mt-5">
        <div className="col-12 mb-3">
          <h2>Orders</h2>
          <hr />
        </div>
        <div className="col-12 mb-3">
          <table class="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>SKU</th>
                <th>Store ID</th>
                <th>Buyer</th>
                <th>Quantity</th>
                <th>Price</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {ordersRows}
            </tbody>
          </table>
        </div>
      </div>
    )
  }
}

Orders.contextTypes = {
  drizzle: PropTypes.object
}

export default Orders;
