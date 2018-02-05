import React from 'react';
import logo from './logo.svg';
import './App.css';
import {
  BrowserRouter as Router,
  Route,
  Link
} from 'react-router-dom'
import Create from './Create.js'
import Withdraw from './Withdraw.js'

const App = () =>
  <Router>
    <div className="App">
      <Link to="/create" className="button">Create</Link>
      <Link to="/withdraw" className="button">Withdraw</Link>

      <div>
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
        </header>
        <Route exact path="/" component={Create}/>
        <Route path="/create" component={Create}/>
        <Route path="/withdraw" component={Withdraw}/>
      </div>
    </div>
  </Router>

export default App
