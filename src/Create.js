import React, { Component } from 'react'
import './App.css'
const Web3 = require('web3')
const walletInterface = require('./MultiSigWallet.json')
const config = require('./config.json')

const web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:8545'))
const wallet = web3.eth.contract(walletInterface.abi).at(config.walletAddress)

/** Functionally replace a single value in an array. */
const replaceArrayValue = (arr, i, value) => {
  return arr.length ? [].concat(
    arr.slice(0, i),
    value,
    arr.slice(i + 1)
  ) : [value]
}

class Create extends Component {

  constructor(props) {
    super(props)

    this.state = {
      error: '',
      output: '',
      wallet: {
        quarum: 2,
        signers: []
      }
    }

    this.out = this.out.bind(this)
    this.error = this.error.bind(this)
    this.create = this.create.bind(this)
    this.createWallet = this.createWallet.bind(this)
    this.reset = this.reset.bind(this)
    this.render = this.render.bind(this)
    this.renderForm = this.renderForm.bind(this)
    this.changeSigner = this.changeSigner.bind(this)
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
      wallet: {
        quarum: 0,
        signers: []
      }
     })
  }

  createWallet() {
    return new Promise((resolve, reject) => {
      wallet.createWallet(this.state.wallet.quarum, this.state.wallet.signers.filter(x => x), { from: web3.eth.accounts[0], gas: 1000000 }, (err, txhash) => {
        if (err) return reject(err)
        const receipt = web3.eth.getTransactionReceipt(txhash)
        const id = +receipt.logs[0].topics[1]
        this.out('Wallet Created: ' + id)
        resolve(id, txhash, receipt)
      })
    })
  }

  create() {
    this.createWallet()
      .catch(this.error)
  }

  changeSigner(i, value) {
    this.setState({
      wallet: Object.assign({}, this.state.wallet, {
        signers: replaceArrayValue(this.state.wallet.signers, i, value)
      })
    })
  }

  renderForm() {
    return <div>
      <div className='form-item form-solo'>
        <label>Quarum: </label><br/>
        <label className='note'>Number of signers required to withdraw funds.</label><br/>
        <input type='text' className='text-right' value={this.state.wallet.quarum} onChange={e => this.setState({
            wallet: Object.assign({}, this.state.wallet, { quarum: e.target.value })
           })
        }/>
      </div>
      <div className='form-item form-solo'>
        <label>Signers: </label><br/>
        {Array.apply(null, { length: Math.max(3, this.state.wallet.signers.length + 1) }).map((x, i) => {
          return <div key={i}><input type='text' value={this.state.wallet.signers[i]} onChange={e => this.changeSigner(i, e.target.value)} /></div>
        })}
      </div>
    </div>
  }

  render() {
    return <form>

      <p className='note vspace-bottom-lg'>Using MultiSigWallet deployed at <span className='address'>{config.walletAddress}</span></p>
      <h1>Create MultiSig Wallet</h1>

      {this.renderForm()}

      <a className='button vspace' onClick={this.create}>Create</a>

      <pre className='output text-left'>
        <p className={'error ' + (this.state.error ? '' : 'hidden')}>{this.state.error}</p>
        <p className={(this.state.output ? '' : 'hidden')}>{this.state.output}</p>
      </pre>

    </form>
  }
}

export default Create
