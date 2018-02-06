import React, { Component } from 'react'
import './App.css'
const Web3 = require('web3')
const walletInterface = require('./MultiSigWallet.json')
const config = require('./config.json')

const web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:8545'))
const wallet = web3.eth.contract(walletInterface.abi).at(config.walletAddress)

class Propose extends Component {

  constructor(props) {
    super(props)

    this.state = {
      error: '',
      output: '',
      withdrawalId: '',
      wallet: null,
      withdrawal: null,
      walletId: 0,
      sender: web3.eth.accounts[0],
      to: '0x0000000000000000000000000000000000000000',
      amount: 0
    }

    this.out = this.out.bind(this)
    this.error = this.error.bind(this)
    this.reset = this.reset.bind(this)
    this.proposeWithdrawal = this.proposeWithdrawal.bind(this)
    this.render = this.render.bind(this)
    this.renderLookupWallet = this.renderLookupWallet.bind(this)
    this.renderWallet = this.renderWallet.bind(this)
    this.lookupWallet = this.lookupWallet.bind(this)
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

  proposeWithdrawal() {
    return new Promise((resolve, reject) => {
      wallet.proposeWithdrawal(this.state.walletId, this.state.to, this.state.amount, { from: this.state.sender, gas: config.gas }, (err, txhash) => {
        if (err) return reject(err)
        const receipt = web3.eth.getTransactionReceipt(txhash)
        // get first 64 bytes of data after the 0x
        // cleaner to decode the log data. See https://ethereum.stackexchange.com/questions/1381/how-do-i-parse-the-transaction-receipt-log-with-web3-js
        const multisigId = +receipt.logs[1].data.slice(0, 66)
        this.setState({
          withdrawal: { multisigId }
        })
        this.out('Withdrawal Proposal created: ' + multisigId)
        resolve(this.state.walletId, txhash, receipt)
      })
    })
  }

  fetchWallet(walletId) {
    return new Promise((resolve, reject) => {
      wallet.wallets(walletId, (err, result) => {
        if (err) return reject(err)
        this.setState({
          wallet: Object.assign({}, this.state.wallet, {
            quarum: result[0],
            balance: result[1]
          })
        })
        resolve(walletId, result)
      })
    })
  }

  fetchSigners(walletId) {
    return new Promise((resolve, reject) => {
      wallet.getWalletSigners(walletId, (err, signers) => {
        if (err) return reject(err)
        this.setState({
          wallet: Object.assign({}, this.state.wallet, { signers })
        })
        resolve(walletId, signers)
      })
    })
  }

  lookupWallet() {
    Promise.all([
      this.fetchWallet(this.state.walletId),
      this.fetchSigners(this.state.walletId),
    ])
      .catch(this.error)
  }

  sign() {
  }

  renderWallet() {
    return <div>
      <h1>Wallet #{this.state.walletId}</h1>

      {this.state.wallet.signers ?
        <div className='form-item form-solo'>
          <label>Signers: </label><br/>
          {Array.apply(null, { length: Math.max(3, this.state.wallet.signers.length) }).map((x, i) => {
            return <div key={i}><span className='text address'>{this.state.wallet.signers[i]}</span></div>
          })}
        </div> : null
      }

      {this.state.wallet.signers ?
        <div className='form-item'>
          <label>Signers needed for withdrawal: </label>
          <span type='text' className='readonly text-right'>{this.state.wallet.quarum.toNumber()} out of {this.state.wallet.signers.length}</span>
        </div> : null
      }

      <div className='form-item'>
        <label>Balance: </label>
        <span type='text' className='readonly text-right'>{this.state.wallet.balance.toString()} Wei</span>
      </div>

      <div className='form-item'>
        <label>Amount: </label>
        <input type='text' className='text-right' value={this.state.amount} onChange={e => this.setState({
          amount: e.target.value
        })} />
      </div>

      <div className='form-item'>
        <label>Sender: </label>
        <input type='text' value={this.state.sender} onChange={e => this.setState({
          sender: e.target.value
        })} />
      </div>

      <div className='form-item'>
        <label>Withdraw Address: </label>
        <input type='text' value={this.state.to} onChange={e => this.setState({
          to: e.target.value
        })} />
      </div>

      <p className='note'>Only one of the signers can propose a withdrawal.</p>
      <a className='button' onClick={this.proposeWithdrawal}>Propose Withdrawal</a>
    </div>
  }

  renderLookupWallet() {
    return <div className='vspace-bottom-lg'>
      <div className='form-item form-solo'>
        <label>Wallet Id: </label>
        <input type='text' className='text-right' value={this.state.walletId} onChange={e => this.setState({
          error: '',
          output: '',
          walletId: +e.target.value,
          wallet: null
        })} />
      </div>

      <a className='button' onClick={this.lookupWallet}>Lookup Wallet</a>
    </div>
  }

  render() {
    return <form>

      <p className='note vspace-bottom-lg'>Using MultiSigWallet deployed at <span className='address'>{config.walletAddress}</span></p>

      {this.renderLookupWallet()}
      {this.state.wallet ? this.renderWallet() : null}

      <pre className='output text-left'>
        <p className={'error ' + (this.state.error ? '' : 'hidden')}>{this.state.error}</p>
        <p className={(this.state.output ? '' : 'hidden')}>{this.state.output}</p>
      </pre>

    </form>
  }
}

export default Propose
