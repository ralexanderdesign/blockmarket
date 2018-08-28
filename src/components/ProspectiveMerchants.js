import React, { Component } from 'react';
import PropTypes from 'prop-types';

class ProspectiveMerchants extends Component {
  constructor(props, context) {
    super(props);
    this.contracts = context.drizzle.contracts;
    this.userAccountKey = this.contracts.BlockMarket.methods.users.cacheCall(this.props.accounts[0]);
    this.prospectIndex = 0;

    this.handleApproveMerchantBtn = this.handleApproveMerchantBtn.bind(this);
    this.handleRejectMerchantBtn = this.handleRejectMerchantBtn.bind(this);
  }

  handleApproveMerchantBtn() {
    this.contracts.BlockMarket.methods.approveMerchant.cacheSend(this.orderIndex, {from: this.props.accounts[0]});
    this.prospectiveMerchantsList = this.contracts.BlockMarket.methods.prospectiveMerchants.cacheCall();
  }

  handleRejectMerchantBtn() {
    this.contracts.BlockMarket.methods.rejectMerchant.cacheSend(this.orderIndex, {from: this.props.accounts[0]});
    this.prospectiveMerchantsList = this.contracts.BlockMarket.methods.prospectiveMerchants.cacheCall();
  }

  render() {  
    let prospectiveMerchantsCards = "";

    if(!(this.props.BlockMarket.getNumberOfProspectiveMerchants.length === undefined)) {
      for (let prospect in this.props.BlockMarket.prospectiveMerchants) {
        prospectiveMerchantsCards += (
          <div className="col-md-3">
            <div className="card mb-4 shadow-sm"> <img className="card-img-top" src="https://via.placeholder.com/300x200/1a1c22/252830" alt="Placeholder" />
              <div className="card-body">
                <h5 className="card-title">{prospect.name}</h5>
                <p className="card-text">{prospect.prospectAddress}</p>
                <div className="d-flex justify-content-between align-items-center">
                  <div className="btn-group">
                    <button type="button" className="btn btn-sm btn-outline-primary" onClick={this.handleApproveMerchantBtn}>Approve</button>
                    <button type="button" className="btn btn-sm btn-outline-secondary" onClick={this.handleRejectMerchantBtn}>Reject</button>
                  </div>
                  <small className="text-muted">User ID: {prospect.userID}</small> </div>
              </div>
            </div>
          </div>
        );
      }
    } else {
      prospectiveMerchantsCards = (
        <div className="col-12 mb-3">
          <p>No applicants yet!</p>
        </div>
      );
    }

    return (
      <div className="row mt-5">
        <div className="col-12 mb-3">
          <h2>Prospective Merchants</h2>
          <hr />
        </div>
        {prospectiveMerchantsCards}
      </div>
    )
  }
}

ProspectiveMerchants.contextTypes = {
  drizzle: PropTypes.object
}

export default ProspectiveMerchants;
