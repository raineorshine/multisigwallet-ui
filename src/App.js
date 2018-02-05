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
import Sign from './Sign.js'
import Deposit from './Deposit.js'

const App = () =>
  <Router>
    <div className="App">
      <nav>
        <Link to="/create" className="button">Create</Link>
        <Link to="/deposit" className="button">Deposit</Link>
        <Link to="/withdraw" className="button">Withdraw</Link>
        <Link to="/sign" className="button">Sign</Link>
      </nav>

      <div>
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
        </header>
        <Route exact path="/" component={Create}/>
        <Route path="/create" component={Create}/>
        <Route path="/deposit" component={Deposit}/>
        <Route path="/withdraw" component={Withdraw}/>
        <Route path="/sign" component={Sign}/>
      </div>
    </div>
  </Router>

export default App
