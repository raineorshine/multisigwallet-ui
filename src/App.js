import React from 'react';
import logo from './logo.svg';
import './App.css';
import {
  BrowserRouter as Router,
  Route,
  Link
} from 'react-router-dom'
import Create from './Create.js'
import Deposit from './Deposit.js'
import Propose from './Propose.js'
import Sign from './Sign.js'
import Execute from './Execute.js'

const App = () =>
  <Router>
    <div className="App">
      <nav>
        <Link to="/create" className="button">Create</Link>
        <Link to="/deposit" className="button">Deposit</Link>
        <Link to="/propose" className="button">Propose</Link>
        <Link to="/sign" className="button">Sign</Link>
        <Link to="/execute" className="button">Execute</Link>
      </nav>

      <div>
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
        </header>
        <Route exact path="/" component={Create}/>
        <Route path="/create" component={Create}/>
        <Route path="/deposit" component={Deposit}/>
        <Route path="/propose" component={Propose}/>
        <Route path="/sign" component={Sign}/>
        <Route path="/execute" component={Execute}/>
      </div>
    </div>
  </Router>

export default App
