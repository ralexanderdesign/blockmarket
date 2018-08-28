import React, { Component } from 'react';
import PropTypes from 'prop-types';

class Products extends Component {
  constructor(props, context) {
    super(props);
    this.state = {
      title: '',
      description: '',
      price: 0,
      stock: 0,
      shippingPrice: 0,
      image: 'https://via.placeholder.com/300x200/1a1c22/252830'
    };

    this.contracts = context.drizzle.contracts;
    this.userAccountKey = this.contracts.BlockMarket.methods.users.cacheCall(this.props.accounts[0]);
    this.currentStoreID = this.props.BlockMarket.users[this.userAccountKey].value.storeID; 

    this.handleChange = this.handleChange.bind(this);
    this.handleOpenStoreBtn = this.handleOpenStoreBtn.bind(this);
  }

  handleChange(event) {
    this.setState({value: event.target.value});
  }

  handleAddProduct(event) {
    this.contracts.BlockMarket.methods.addProduct.cacheSend(...this.state, {from: this.props.accounts[0]});
    this.productRegistry = this.contracts.BlockMarket.methods.productRegistry.cacheCall(this.currentStoreID);
    
    event.preventDefault();
  }

  render() {
    let userControls;
    if(this.props.BlockMarket.users[this.userAccountKey].value.role === 1) {
      userControls = (
        <div class="btn-group">
          <button type="button" class="btn btn-sm btn-outline-primary">Edit</button>
          <button type="button" class="btn btn-sm btn-outline-secondary">Delete</button>
        </div>
      );
    } else {
      userControls = (
        <button type="button" className="btn btn-sm btn-outline-primary">Add to Cart</button>
      );
    } 

    let addProduct = (
      <div className="col-md-3">
        <div className="card mb-4 h-100 shadow-sm">
          <div className="card-body">
          <h5 className="card-title">Add a New Product</h5>
          <hr />
          <form>
            <div className="form-group" onSubmit={this.handleAddProduct}>
              <input name="title" type="text" value={this.state.value} onChange={this.handleChange} className="form-control form-control-sm" placeholder="Title" required />
            </div>
            <div className="form-group">
              <input name="description" type="text" value={this.state.value} onChange={this.handleChange} className="form-control form-control-sm" placeholder="Description" required />
            </div>
            <div className="form-group">
              <input name="price" type="number" value={this.state.value} onChange={this.handleChange} className="form-control form-control-sm" placeholder="Price" required />
            </div>
            <div className="form-group">
              <input name="stock" type="number" value={this.state.value} onChange={this.handleChange} className="form-control form-control-sm" placeholder="Stock" required />
            </div>
            <div className="form-group">
              <input name="shippingPrice" type="number" value={this.state.value} onChange={this.handleChange} className="form-control form-control-sm" placeholder="Shipping Price" required />
            </div>
            <div className="form-group">
              <input name="image" type="url" value={this.state.value} onChange={this.handleChange} className="form-control form-control-sm" placeholder="Image URL" />
            </div>
            <br />
            <button type="submit" value="submit" className="btn btn-sm btn-outline-primary">Create</button>
          </form>
          </div>
        </div>
      </div>
    );

    let productsCards = "";

    if(!(this.props.BlockMarket.stores[this.userAccountKey] === undefined)) {

      // for (let product in this.props.BlockMarket.products) {
      productsCards = this.props.BlockMarket.products.map((product) =>
        <div className="col-md-3">
          <div className="card mb-4 shadow-sm"> <img className="card-img-top" src={product.img} alt="Placeholder" />
            <div className="card-body">
              <h5 className="card-title">{product.title}</h5>
              <h6 class="card-subtitle my-2 text-muted">${product.price}, Stock: {product.quantity}</h6>
              <p className="card-text">{product.description}</p>
              <div className="d-flex justify-content-between align-items-center">
                {userControls}
                <small className="text-muted"><i class="fas fa-shipping-fast"></i> ${product.shippingPrice}</small> </div>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="row mt-5">
        <div className="col-12 mb-3">
          <h2>Products</h2>
          <hr />
        </div>
        {addProduct}
        {productsCards}
      </div>
    )
  }
}

Products.contextTypes = {
  drizzle: PropTypes.object
}

export default Products;
