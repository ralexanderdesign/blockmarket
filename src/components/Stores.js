import React, { Component } from 'react';
import PropTypes from 'prop-types';

class Stores extends Component {
  constructor(props, context) {
    super(props);
    this.state = {
      title: '',
      description: ''
    };

    this.contracts = context.drizzle.contracts;
    this.userAccountKey = this.contracts.BlockMarket.methods.users.cacheCall(this.props.accounts[0]);

    this.handleChange = this.handleChange.bind(this);
    this.handleOpenStore = this.handleOpenStore.bind(this);
  }

  handleChange(event) {
    this.setState({value: event.target.value});
  }

  handleOpenStore(event) {
    this.contracts.BlockMarket.methods.openStore.cacheSend(...this.state, {from: this.props.accounts[0]});
    this.storeRegistry = this.contracts.BlockMarket.methods.storeRegistry.cacheCall({from: this.props.accounts[0]});
   
    event.preventDefault();
  }

  render() {  
    let storesAvailable;

    if(this.props.BlockMarket.users[this.userAccountKey].value.role === 1) {
      let storeIDsOwned = this.props.BlockMarket.storeRegistry[this.props.accounts[0]];
      storeIDsOwned.array.forEach(storeID => {
        storesAvailable.push(this.props.BlockMarket.stores[storeID - 1]);
      }); 
    } 
    if(this.props.BlockMarket.users[this.userAccountKey].value.role === 2) {
      storesAvailable = this.props.BlockMarket.stores;
    } 

    let openStore = (
      <div className="col-md-3">
        <div className="card mb-4 h-100 shadow-sm">
          <div className="card-body">
            <h5 className="card-title">Open a New Store</h5>
            <hr />
            <form onSubmit={this.handleOpenStore}>
              <div className="form-group">
                <input name="title" type="text" value={this.state.value} onChange={this.handleChange} className="form-control form-control-sm" placeholder="Title" required />
              </div>
              <div className="form-group">
                <input name="description" type="text" value={this.state.value} onChange={this.handleChange} className="form-control form-control-sm" placeholder="Description" required />
              </div>
              <br />
              <button type="submit" value="submit" className="btn btn-sm btn-outline-primary">Create</button>
            </form>
          </div>
        </div>
      </div>
    );

    let storesCards;

    if(!(this.props.BlockMarket.getNumberOfStoresOwned[this.userAccountKey] === undefined)) {
      storesCards = storesAvailable.map((store) =>
        <div className="col-md-3">
          <div className="card mb-4 h-100 shadow-sm">
            <div className="card-body">
              <h5 className="card-title">{store.title}</h5>
              <h6 class="card-subtitle mb-2 text-muted">Owner: {this.props.BlockMarket.users[store.owner].name}</h6>
              <p className="card-text">{store.description}</p>
              <div className="d-flex justify-content-between align-items-center">
                <button type="button" className="btn btn-sm btn-outline-primary">Show Products</button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="row mt-5">
        <div className="col-12 mb-3">
          <h2>Stores</h2>
          <hr />
        </div>
        {openStore}
        {storesCards}
      </div>
    )
  }
}

Stores.contextTypes = {
  drizzle: PropTypes.object
}

export default Stores;
