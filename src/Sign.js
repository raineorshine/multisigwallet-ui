import React, { Component } from 'react'
import './App.css'
const Web3 = require('web3')
const walletInterface = require('./MultiSigWallet.json')
const config = require('./config.json')

const web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:8545'))
const wallet = web3.eth.contract(walletInterface.abi).at(config.walletAddress)

class Sign extends Component {

  constructor(props) {
    super(props)

    this.state = {
      error: '',
      output: '',
      withdrawalId: '',
      wallet: null,
      withdrawal: null,
      walletId: 0,
      to: '0x0000000000000000000000000000000000000000',
      amount: 0
    }

    this.out = this.out.bind(this)
    this.error = this.error.bind(this)
    this.reset = this.reset.bind(this)
    this.render = this.render.bind(this)
    this.renderLookupWithdrawal = this.renderLookupWithdrawal.bind(this)
    this.renderWallet = this.renderWallet.bind(this)
    this.renderSign = this.renderSign.bind(this)
    this.lookupWallet = this.lookupWallet.bind(this)
    this.lookupSignal = this.lookupSignal.bind(this)
    this.sign = this.sign.bind(this)
    this.fetchSignal = this.fetchSignal.bind(this)
    this.fetchWallet = this.fetchWallet.bind(this)
  }

  /* NOTE: one per function */
  out(value) {
    this.setState({ output: this.state.output + value + '\n' })
  }

  error(value) {
    this.setState({ error: value.toString() })
  }

  reset() {
    this.setState({
      output: '',
      error: ''
    })
  }

  fetchWallet(walletId) {
    return new Promise((resolve, reject) => {
      wallet.wallets(walletId, (err, result) => {
        if (err) return reject(err)
        this.setState({
          wallet: {
            quarum: result[0],
            balance: result[1]
          }
        })
        resolve(walletId, result)
      })
    })
  }

  fetchSignal(withdrawalId) {
    return new Promise((resolve, reject) => {
      wallet.withdrawals(withdrawalId, (err, withdrawal) => {
        if (err) return reject(err)
        this.setState({ withdrawal })
        resolve(withdrawalId, withdrawal)
      })
    })
  }

  lookupWallet() {
    this.fetchWallet(this.state.walletId)
      .then(() => this.fetchWallet(this.state.walletId))
      .catch(this.error)
  }

  lookupSignal() {
    this.fetchSignal(this.state.withdrawalId)
      .then(() => this.fetchWallet(this.state.walletId))
      .catch(this.error)
  }

  sign() {
  }

  renderWallet() {
    return <div>
      <h1>Sign from Wallet {this.state.walletId}</h1>

      <div className='form-item'>
        <label>Balance: </label>
        <span type='text' className='text-right'>{this.state.wallet.balance.toString()} ETH</span>
      </div>

      <div className='form-item'>
        <label>Amount: </label>
        <input type='text' className='text-right' value={this.state.amount} onChange={e => this.setState({
          error: '',
          output: '',
          amount: e.target.value
        })} />
      </div>
      <a className='button' onClick={this.deposit}>Deposit</a>
      <a className='button' onClick={this.proposeSignal}>Propose Signal</a>
    </div>
  }

  renderLookupWithdrawal() {
    return <div>
      <div className='form-item form-solo'>
        <label>Withdrawal Id: </label>
        <input type='text' className='text-right' value={this.state.withdrawalId} onChange={e => this.setState({
          error: '',
          output: '',
          withdrawalId: +e.target.value
        })} />
      </div>

      <a className='button' onClick={this.lookupSignal}>Lookup Withdrawal</a>
    </div>
  }

  renderSign() {
    return <div>
      <h1>Sign</h1>

      <div className='form-item'>
        <label>Balance: </label>
        <span type='text' className='text-right'>{this.state.wallet.balance.toString()} ETH</span>
      </div>

      {this.state.wallet ?
        <div className='form-item'>
          <label>Amount to withdraw: </label>
          <span type='text' className='text-right'>{this.state.withdrawal.amount}</span>
        </div> :
        '...'
      }

      <a className='button vspace' onClick={this.sign}>Sign</a>
    </div>
  }

  render() {
    return <form>

      <p className='note vspace-bottom-lg'>Using MultiSigWallet deployed at <span className='address'>{config.walletAddress}</span></p>

      {this.renderLookupWithdrawal()}
      {this.state.withdrawal ? this.renderSign() : null}

      <pre className='output text-left'>
        <p className={'error ' + (this.state.error ? '' : 'hidden')}>{this.state.error}</p>
        <p className={(this.state.output ? '' : 'hidden')}>{this.state.output}</p>
      </pre>

    </form>
  }
}

export default Sign
