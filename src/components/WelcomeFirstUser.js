import React, { Component } from 'react';
import PropTypes from 'prop-types';

class WelcomeFirstUser extends Component {
  constructor(props, context) {
    super(props);
    this.contracts = context.drizzle.contracts;
    this.userAccountKey = this.contracts.BlockMarket.methods.users.cacheCall(this.props.accounts[0]);

    this.handleSetAdminBtn = this.handleSetAdminBtn.bind(this);
  }

  handleSetAdminBtn() {
    this.contracts.BlockMarket.methods.setAdmin.cacheSend({from: this.props.accounts[0]});
    this.userAccountKey = this.contracts.BlockMarket.methods.users.cacheCall(this.props.accounts[0]);
  }

  render() {  
    return (
      <section className="jumbotron h-100 admin text-center bg-dark">
        <div className="container animated zoomInDown">
          <h1 className="jumbotron-heading">Welcome, master.</h1>
          <p className="lead text-muted">You have released me... you are my master now. Click below to become the site admin.</p>
          <div>
            <button type="button" className="btn btn-primary" onClick={this.handleSetAdminBtn}>Register as Admin</button>
          </div>
        </div>
      </section>
    )
  }
}

WelcomeFirstUser.contextTypes = {
  drizzle: PropTypes.object
}

export default WelcomeFirstUser;
