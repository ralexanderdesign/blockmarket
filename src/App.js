import React, { Component } from 'react';
import { Route } from 'react-router';
import HomeContainer from './containers/HomeContainer';

// Styles
import './css/bootstrap.min.css'
import './App.css'

class App extends Component {
  render() {
    return (
      <div className="App">
        <Route exact path="/" component={HomeContainer}/>
      </div>
    );
  }
}

export default App;
