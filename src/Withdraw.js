import React, { Component } from 'react'
import './App.css'
const Web3 = require('web3')
const walletInterface = require('./MultiSigWallet.json')

const contractAddress = '0x72be480b025419528535d0c1bb4bb3ede0e29b0f'
const web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:8545'))
const wallet = web3.eth.contract(walletInterface.abi).at(contractAddress)

class Withdraw extends Component {

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
    this.proposeWithdrawal = this.proposeWithdrawal.bind(this)
    this.render = this.render.bind(this)
    this.renderLookupWithdrawal = this.renderLookupWithdrawal.bind(this)
    this.renderLookupWallet = this.renderLookupWallet.bind(this)
    this.renderPropose = this.renderPropose.bind(this)
    this.renderSign = this.renderSign.bind(this)
    this.lookupWallet = this.lookupWallet.bind(this)
    this.lookupWithdrawal = this.lookupWithdrawal.bind(this)
    this.sign = this.sign.bind(this)
    this.fetchWithdrawal = this.fetchWithdrawal.bind(this)
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
      wallet.proposeWithdrawal(this.state.walletId, this.state.to, this.state.amount, { from: web3.eth.accounts[0] }, (err, txhash) => {
        if (err) return reject(err)
        const receipt = web3.eth.getTransactionReceipt(txhash)
        const logs = receipt.logs[0].topics
        console.log(logs)
        this.setState({ withdrawal: {} })
        resolve(this.state.walletId, txhash, receipt)
      })
    })
  }

  fetchWallet(walletId) {
    return new Promise((resolve, reject) => {
      wallet.wallets(walletId, (err, wallet) => {
        if (err) return reject(err)
        this.setState({ wallet })
        resolve(walletId, wallet)
      })
    })
  }

  fetchWithdrawal(withdrawalId) {
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

  lookupWithdrawal() {
    this.fetchWithdrawal(this.state.withdrawalId)
      .then(() => this.fetchWallet(this.state.walletId))
      .catch(this.error)
  }

  sign() {
  }

  renderPropose() {
    return <div>
      <h1>Withdraw from Wallet {this.state.walletId}</h1>

      <div className='form-item'>
        <label>Amount: </label>
        <input type='text' className='text-right' value={this.state.amount} onChange={e => this.setState({
          error: '',
          output: '',
          amount: e.target.value
        })} />
      </div>
      <a className='button' onClick={this.proposeWithdrawal}>Propose Withdrawal</a>
    </div>
  }

  renderLookupWallet() {
    return <div>
      <div className='form-item'>
        <label>Wallet Id: </label>
        <input type='text' className='text-right' value={this.state.walletId} onChange={e => this.setState({
          error: '',
          output: '',
          walletId: +e.target.value
        })} />
      </div>

      <a className='button' onClick={this.lookupWallet}>Lookup Wallet</a>
    </div>
  }

  renderLookupWithdrawal() {
    return <div>
      <div className='form-item'>
        <label>Withdrawal Id: </label>
        <input type='text' className='text-right' value={this.state.withdrawalId} onChange={e => this.setState({
          error: '',
          output: '',
          withdrawalId: +e.target.value
        })} />
      </div>

      <a className='button' onClick={this.lookupWithdrawal}>Lookup Withdrawal</a>
    </div>
  }

  renderSign() {
    return <div>
      <h1>Sign</h1>

      <div className='form-item'>
        <label>Balance: </label>
        <span type='text' className='text-right'>{this.state.wallet.balance}</span>
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

      <p className='note vspace-bottom-lg'>Using MultiSigWallet deployed at <span className='address'>{contractAddress}</span></p>

      {this.renderLookupWallet()}
      {this.state.wallet ? this.renderPropose() : null}
      <br/>
      {this.renderLookupWithdrawal()}
      {this.state.withdrawal ? this.renderSign() : null}

      <pre className='output text-left'>
        <p className={'error ' + (this.state.error ? '' : 'hidden')}>{this.state.error}</p>
        <p className={(this.state.output ? '' : 'hidden')}>{this.state.output}</p>
      </pre>

    </form>
  }
}

export default Withdraw
