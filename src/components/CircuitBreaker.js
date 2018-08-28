import React, { Component } from 'react';
import PropTypes from 'prop-types';

class CircuitBreaker extends Component {
  constructor(props, context) {
    super(props);
    this.contracts = context.drizzle.contracts;

    this.handleToggleBreakerBtn = this.handleToggleBreakerBtn.bind(this);
  }

  handleToggleBreakerBtn() {
    this.contracts.BlockMarket.methods.toggleCircuitBreaker.cacheSend({from: this.props.accounts[0]});
    this.breakerStatus = this.contracts.BlockMarket.methods.toggleCircuitBreaker.cacheCall();
  }

  render() {  
    return (
      <div className="row mt-5">
        <div className="col-12 mb-2">
          <h2>Emergency Circuit Breaker</h2>
          <hr />
        </div>
        <div className="col-12 mb-2">
          <button type="button" className="btn btn-outline-primary" onClick={this.handleToggleBreakerBtn}>Toggle Breaker</button>
        </div>
      </div>
    )
  }
}

CircuitBreaker.contextTypes = {
  drizzle: PropTypes.object
}

export default CircuitBreaker;
