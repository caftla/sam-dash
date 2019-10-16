import React from 'react'
import { postForPdf } from '../../helpers'
import R from 'ramda'

const remember_me = (name: string, email: string) =>
  R.pipe(
      R.concat
    , btoa
    , x => localStorage.setItem('whoami', x)
  )(`${name}=`, email)

const my_data = localStorage.getItem('whoami')

const who_am_i = R.pipe(
      atob
    , R.split('=')
    , R.map(x => x.trim())
  )(!!my_data ? my_data : '')

const filter_params_from_filter_string = (filter) => R.pipe(
  R.split(',')
  , R.map(R.split('='))
  , R.fromPairs
)(filter || '-')

export class DownloadPDF extends React.Component {

  props: Props
  state: {
    downloading_pdf: boolean
  , name: string
  , email: string
  , error: boolean
  , invalidEmail: boolean
  , set_name: (name: string) => void
  , set_email: (email: string) => void
  }

  constructor(props : any) {
    super(props)

    this.state = {
      downloading_pdf: false
    , name: who_am_i[0] || ''
    , email: who_am_i[1] || ''
    , error: false
    , invalidEmail: false
    , server_error: false
    }
  }

  componentDidMount() {
    this.props.set_name(who_am_i[0] || '')
    this.props.set_email(who_am_i[1] || '')
  }

  nameChange(name) {
    this.setState({ name })
    this.props.set_name(name)
  }

  emailChange(email) {
    this.setState({ email })
    this.props.set_email(email)
  }

  validateEmail(email) {
    const regex = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return regex.test(email)
  }

  send_url_to_server = (e) => {
    if (!this.state.name || !this.state.email) {
      this.setState({ error: true, server_error: false })
    } else {
      this.setState({ error: false, invalidEmail: false })
      if (this.validateEmail(this.state.email)) {
        e.preventDefault()
        this.setState({ downloading_pdf: true, server_error: false })
        const api_root = process.env.api_root || '' // in production api_root is the same as the client server
        const filter_params = filter_params_from_filter_string(this.props.filter)
        const affiliate_name = filter_params.affiliate_name
        const publisher_name = filter_params.publisher_name
        const date_from = this.props.date_from
        const date_to = this.props.date_to
        const { name, email } = this.state
        postForPdf({url: `${api_root}/api/v1/co_invoices/generate_pdf`,
          body: {
            url: window.location.href
          , affiliate_name
          , publisher_name
          , date_from
          , date_to
          , name
          , email
          }
        })
        .then((file) => {
          saveAs(file, `${affiliate_name}-${date_from}-${date_to}`)
          this.setState({ downloading_pdf: false, server_error: false })
          remember_me(name, email)
        })
        .catch((err) => {
          console.error(err)
          this.setState({ downloading_pdf: false, server_error: true })
        })
      } else {
        this.setState({ invalidEmail: true, server_error: false })
      }
    }
  }

  render() {
    return <div className="account-manager no-print">
      <div>
        <p style={{ marginLeft: '20px', fontSize: '14px' }}>Here are the stats for <span style={{fontWeight: 'bolder'}}>{this.props.filter.replace('affiliate_name=','')}</span></p>
        
        <label
          className="pdf-label"
          htmlFor="account-manager-name">
          Account Manager Name*:
        </label>

        <input
          onChange={event => this.nameChange(event.target.value)}
          value={this.state.name}
          className="pdf-input"
          id="name"
          type="text"
          required
        />

        <label
          className="pdf-label"
          htmlFor="account-manager-email">
          Email Address*:
        </label>

        <input
          onChange={event => this.emailChange(event.target.value)}
          value={this.state.email}
          className="pdf-input"
          id="email"
          type="text"
          required
        />

        <button
          className="download-pdf-btn" 
          onClick={this.send_url_to_server}
          style={{ height: '32px', cursor: 'pointer', float: 'none', marginLeft: '20px', width: '200px', fontSize: '13px' }}
        >
          {this.state.downloading_pdf
            ? <i className="fa fa-circle-o-notch fa-spin-custom" />
            : <i className="fa fa-file-pdf-o" aria-hidden="true" /> }
          &ensp;Download Co-Invoice
        </button>
      </div>
      {this.state.error
        ? <p className="error-msg">Please fill required fields to download pdf!</p>
        : ''}
      {this.state.invalidEmail
        ? <p className="error-msg">Please enter a valid email address!</p>
        : ''}
      {this.state.server_error
        ? <p className="error-msg">There was an error downloading the pdf :(.. Try again?</p>
        : ''}
      <p style={{ marginLeft: '20px', fontSize: '12px' }}>*required </p>
    </div>
  }
}
