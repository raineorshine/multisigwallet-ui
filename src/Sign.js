import React, { Component } from 'react'
import './App.css'
import { Link } from 'react-router-dom'
const Web3 = require('web3')
const walletInterface = require('./MultiSigWallet.json')
const config = require('./config.json')

const web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:8545'))
const wallet = web3.eth.contract(walletInterface.abi).at(config.walletAddress)

const [STATUS_OPEN, STATUS_COMPLETED, STATUS_CANCELED] = [0,1,2]

/** Checks if the given signer has signed the proposal. */
const hasSigned = (multisigId, signer) => {
  return new Promise((resolve, reject) => {
    wallet.hasSigned(multisigId, signer, (err, result) => {
      if (err) return reject(err)
      resolve([signer, result])
    })
  })
}

class Sign extends Component {

  constructor(props) {
    super(props)

    this.state = {
      error: '',
      output: '',
      withdrawalId: '',
      wallet: null,
      withdrawal: null,
      sender: web3.eth.accounts[1]
    }

    this.out = this.out.bind(this)
    this.error = this.error.bind(this)
    this.reset = this.reset.bind(this)
    this.render = this.render.bind(this)
    this.renderLookupWithdrawal = this.renderLookupWithdrawal.bind(this)
    this.renderWallet = this.renderWallet.bind(this)
    this.renderSign = this.renderSign.bind(this)
    this.lookupWithdrawal = this.lookupWithdrawal.bind(this)
    this.sign = this.sign.bind(this)
    this.fetchWithdrawal = this.fetchWithdrawal.bind(this)
    this.fetchWallet = this.fetchWallet.bind(this)
    this.fetchHasSigned = this.fetchHasSigned.bind(this)
  }

  /* NOTE: one per function */
  out(value) {
    this.setState({ output: this.state.output + value + '\n' })
  }

  error(value) {
    console.error(value)
    this.setState({ error: value.toString() })
  }

  reset() {
    this.setState({
      output: '',
      error: ''
    })
  }

  fetchWithdrawal(withdrawalId) {
    return new Promise((resolve, reject) => {
      wallet.withdrawals(withdrawalId, (err, result) => {
        if (err) return reject(err)
        this.setState({
          withdrawal: {
            walletId: result[0].toNumber(),
            creator: result[1],
            to: result[2],
            multisigId: result[3].toNumber(),
            amount: result[4],
            status: result[5].toNumber()
          }
        })
        resolve([withdrawalId, result])
      })
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
        resolve([walletId, result])
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
        resolve([walletId, signers])
      })
    })
  }

  /** Check the signature status of all signers. */
  fetchHasSigned() {
    return Promise.all(this.state.wallet.signers.map(signer => hasSigned(this.state.withdrawal.multisigId, signer)))
      .then(hasSignedArray => {
        this.setState({
          wallet: Object.assign({}, this.state.wallet, {
            hasSigned: hasSignedArray.map(([signer, signed]) => signed)
          })
        })
      })
  }

  lookupWithdrawal() {
    this.fetchWithdrawal(this.state.withdrawalId)
      .then(() => Promise.all([
        this.fetchWallet(this.state.withdrawal.walletId),
        this.fetchSigners(this.state.withdrawal.walletId)
          .then(this.fetchHasSigned)
      ]))
      .catch(this.error)
  }

  sign() {
    return new Promise((resolve, reject) => {
      wallet.sign(this.state.withdrawal.multisigId, { from: this.state.sender, gas: config.gas }, (err, txhash) => {
        if (err) return reject(err)
        this.out('Withdrawal Signed')

        const signerIndex = this.state.wallet.signers.indexOf(this.state.sender)
        const newSigned = this.state.wallet.hasSigned.slice()
        newSigned[signerIndex] = true
        if (signerIndex >= 0) {
          this.setState({
            wallet: Object.assign({}, this.state.wallet, {
              hasSigned: newSigned
            })
          })
        }

        resolve([this.state.withdrawal.walletId, txhash])
      })
    })
      .catch(this.error)
  }

  renderWallet() {
    return <div>
      <h1>Sign Withdrawal #{this.state.withdrawalId} for Wallet #{this.state.withdrawal.walletId}</h1>

      <div className='form-item'>
        <label>Balance: </label>
        <span type='text' className='text-right'>{this.state.wallet.balance.toString()} Wei</span>
      </div>

      <div className='form-item'>
        <label>Amount: </label>
        <input type='text' className='text-right' value={this.state.amount} onChange={e => this.setState({
          error: '',
          output: '',
          amount: e.target.value
        })} />
      </div>
    </div>
  }

  renderLookupWithdrawal() {
    return <div className='vspace-bottom-lg'>
      <div className='form-item form-solo'>
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
        <label>Wallet Id: </label>
        <span type='text' className='readonly text-right'>{this.state.withdrawal.walletId}</span>
      </div>

      {this.state.wallet ?
        <div>
          <div className='form-item'>
            <label>Balance: </label>
            <span type='text' className='text-right readonly'>{this.state.wallet.balance.toString()} Wei</span>
          </div>
        </div> : null
      }

      <div className='form-item'>
        <label>Amount to withdraw: </label>
        <span type='text' className='readonly text-right'>{this.state.withdrawal.amount.toString()} Wei</span>
      </div>

      <div className='form-item'>
        <label>Withdrawal address: </label>
        <span type='text' className='readonly'>{this.state.withdrawal.to.toString()}</span>
      </div>

      {this.state.wallet && this.state.wallet.signers ?
        <div className='form-item form-solo'>
          <label>Signers: </label><br/>
          {Array.apply(null, { length: Math.max(3, this.state.wallet.signers.length) }).map((x, i) => {
            return <div key={i}>
              <span className='text address'>{this.state.wallet.signers[i]}</span>
              {this.state.wallet.hasSigned ? <span className='address-annotation'>{this.state.wallet.hasSigned[i] ? '✓ signed' : '✗ awaiting signature'}</span> : null}
            </div>
          })}
        </div> : null
      }

      {this.state.withdrawal && this.state.withdrawal.status === STATUS_COMPLETED ?
          <p className='note'>This withdrawal has been completed.</p>
        : this.state.withdrawal && this.state.withdrawal.status === STATUS_CANCELED ?
          <p className='note'>This withdrawal has been canceled.</p>
        : this.state.wallet && this.state.wallet.hasSigned && this.state.wallet.hasSigned.filter(x => x).length >= this.state.wallet.quarum ?
        <p className='note'>Quarum has been obtained. Any signer may <Link to="/execute">execute the withdrawal</Link>.</p>
        : <div>
          <div className='form-item'>
            <label>Signing Address: </label>
            <input type='text' value={this.state.sender} onChange={e => this.setState({
              sender: e.target.value
            })} />
          </div>
          <a className='button vspace' onClick={this.sign}>Sign</a>
        </div>
      }
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
