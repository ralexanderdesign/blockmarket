import React, { Component } from 'react';
import PropTypes from 'prop-types';

import WelcomeFirstUser from '../containers/WelcomeFirstUserContainer';
import CircuitBreaker from '../containers/CircuitBreakerContainer';
import ProspectiveMerchants from '../containers/ProspectiveMerchantsContainer';
import Stores from '../containers/StoresContainer';
// import Products from '../containers/ProductsContainer';
import Orders from '../containers/OrdersContainer';

import logo from '../img/blockmarket_w.svg';

class Home extends Component {
  constructor(props, context) {
    super(props);
    this.contracts = context.drizzle.contracts;
    this.adminInitializedKey = this.contracts.BlockMarket.methods.adminInitialized.cacheCall();
    this.userAccountKey = this.contracts.BlockMarket.methods.users.cacheCall(this.props.accounts[0]);

    this.handleSetAdminBtn = this.handleSetAdminBtn.bind(this);
  }

  handleSetAdminBtn() {
    this.contracts.BlockMarket.methods.setAdmin.cacheSend({from: this.props.accounts[0]});
    this.userAccountKey = this.contracts.BlockMarket.methods.users.cacheCall(this.props.accounts[0]);
  }

  render() {
    if(!(this.adminInitializedKey in this.props.BlockMarket.adminInitialized)) {
      return (
        <h1>Waking the genie...</h1>
      )
    }

    let viewByRole;

    // uninitialized admin view
    if(this.props.BlockMarket.adminInitialized[this.adminInitializedKey].value === false) {

      viewByRole = (
        <WelcomeFirstUser />
      );

    // check for user roles
    } else {

      if(!(this.userAccountKey in this.props.BlockMarket.users)) {
        return (
          <h1>Loading user permissions...</h1>
        )
      }

      // admin view
      if(this.props.BlockMarket.users[this.userAccountKey].value.role === '0') {

        // console.log('admin view');
        viewByRole = (
          <section className="container">
            <ProspectiveMerchants />
            <CircuitBreaker />
          </section>
        );

      // merchant view
      } else if(this.props.BlockMarket.users[this.userAccountKey].value.role === '1') {

        // console.log('merchant view');
        viewByRole = (
          <section className="container">
            <Stores />
            <Orders />
          </section>
        );

      // shopper view
      // default view as shoppers may or not be registered and thus may not have a role assigned
      } else {

        // console.log('shopper view');
        viewByRole = (
          <section className="container">
            <Stores />
          </section>
        );
      } 
    }

    return (
      <div>
        <header>
          <div className="navbar navbar-dark bg-dark shadow-sm">
            <div className="container d-flex"> <a href="/" className="navbar-brand"> <img className="logo" src={logo} alt="Block Market" />Block Market </a>
              <div className="pull-right">
                <a href="#">
                  <span className="fa-stack fa-sm">
                    <i className="fas fa-circle fa-stack-2x"></i>
                    <i className="fas fa-user fa-stack-1x fa-inverse text-dark"></i>
                  </span>
                </a> &nbsp;
                <a href="#">
                  <span className="fa-stack fa-sm">
                    <i className="fas fa-circle fa-stack-2x"></i>
                    <i className="fas fa-shopping-cart fa-stack-1x fa-inverse text-dark"></i>
                  </span>
                </a>
              </div>
            </div>
          </div>
        </header>
        <main>
          {viewByRole}
        </main>
        <footer className="text-muted">
          <div className="container">
            <div className="row mt-5">
              <div className="col-md">
                <p><span className="text-white">Active Account:</span> {this.props.accounts[0]}</p>
                <p>&copy; Block Market 2018. All rights reserved.</p>
              </div>
            </div>
          </div>
        </footer>
      </div>
    )
  }
}

Home.contextTypes = {
  drizzle: PropTypes.object
}

export default Home;
