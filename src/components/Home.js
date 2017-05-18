// @flow

import React from 'react'
import { connect } from 'react-redux'
import { Redirect } from 'react-router'

import SimpleTabs from './plottables/simple-tabs'

import StandardControls from './filter_page_section_row/Controls'
import ConvertingIPsControls from './converting_ips/Controls'
import CohortControls from './cohort/Controls'
import MonthlyReportsControls from './monthly_reports/Controls'

import type { QueryParams } from 'my-types'
import type { FetchState } from '../adts'
import { match } from '../adts'
import { sequence } from '../helpers'

import {
    login, check_loggedin
  , fetch_all_countries, set_params, cleanup_fetch_filter_section_row
  , fetch_all_affiliates
} from '../actions'

import { fromQueryString } from '../helpers'

import * as maybe from 'flow-static-land/lib/Maybe'
import type { Maybe } from 'flow-static-land/lib/Maybe'

import { Submit, DateField, FormTitle, FormRow, FormLabel, FormContainer, FormSection, FilterFormSection, Select } from './Styled'

type LoginProps = {
  login: (username: string, password: string) => void
}

type LoginState = {
    username: string
  , password: string
  , invalid_password: boolean
}

class Login extends React.Component {

  state: LoginState
  props: LoginProps

  constructor(props) {
    super(props)
    this.state = {
        username: ''
      , password: ''
      , invalid_password: false
    }
  }

  render() {

    const invalid_password_component = this.state.invalid_password
      ? <FormRow>
          <FormLabel>&nbsp;</FormLabel>
          <div>Invalid Password</div>
        </FormRow>
      : ''

    return <FormContainer>
      <FormSection>
        <FormRow>
          <FormLabel>Username</FormLabel>
          <DateField type="text" onChange={ e => this.setState({ username: e.target.value }) } />
        </FormRow>
        <FormRow>
          <FormLabel>Password</FormLabel>
          <DateField type="password" onChange={ e => this.setState({ password: e.target.value }) } />
        </FormRow>
        { invalid_password_component }
        <FormRow>
          <Submit onClick={ () => {
            this.props.login( this.state.username, this.state.password )
          } }>Login</Submit>
        </FormRow>
      </FormSection>
    </FormContainer>
  }
}

type HomeProps = {
    params: QueryParams
  , set_params: QueryParams => void
  , cleanup_fetch_filter_section_row: () => void
  , fetch_all_countries: (date_from: string, date_to: string) => void
  , all_countries: Maybe<Array<any>>
  , fetch_all_affiliates: () => void
  , all_affiliates: Maybe<Array<any>>
  , history: any
  , login: (username: string, password: string) => void
  , check_loggedin: () => void
  , login_state: FetchState<boolean>
}

type HomeState = {
}

class Home extends React.Component {

  state: HomeState
  props: HomeProps

  constructor(props: HomeProps) {
    super(props)

    match({
        Nothing: () => this.props.check_loggedin()
      , Loading: () => void 8
      , Error: (error) => void 8
      , Loaded: (data) => void 8
    })(this.props.login_state)
  }

  componentWillUpdate(nextProps, b) {

    if(nextProps.login_state != this.props.login_state && true === nextProps.login_state) {
      const query = fromQueryString(window.location.search.substring(1))
      if(!!query.login_redir) {
        window.location.href = decodeURIComponent(query.login_redir)
      }
    }

    const {params} = nextProps
    const current_params = this.props.params

    if(current_params.date_from != params.date_from || current_params.date_to != params.date_to) {
      nextProps.fetch_all_countries(params.date_from, params.date_to)
    }
  }

  componentDidMount() {
    const { params } = this.props
    this.props.fetch_all_affiliates()
    this.props.fetch_all_countries(params.date_from, params.date_to)
  }

  render() {
    const { params, login_state } = this.props

    return match({
        Nothing: () => <Login login={ this.props.login } />
      , Loading: () => <div>Logging in...</div>
      , Error: (error) => <div>Loggin error</div>
      , Loaded: (logged_in) => !logged_in
        ? <Login login={ this.props.login } />
        :
            maybe.maybe(
              _ => {
                return <div>Loading...</div>
              }
             , ([all_countries, all_affiliates]) => _ => {
                return <SimpleTabs>
                  <div name="Standard">
                    <StandardControls params={ params }
                      countries={ all_countries }
                      set_params={ params => {
                        this.props.set_params(params)
                        this.props.cleanup_fetch_filter_section_row()
                        this.props.fetch_all_countries(params.date_from, params.date_to)
                        this.props.history.push(`/filter_page_section_row/${params.date_from}/${params.date_to}/${params.filter}/${params.page}/${params.section}/${params.row}`)
                      } }
                    />
                  </div>
                  <div name="Converting IPs">
                    <ConvertingIPsControls params={ params }
                      countries={ all_countries }
                      affiliates={ all_affiliates }
                      history={ this.props.history }
                    />
                  </div>
                  <div name="Cohort">
                    <CohortControls params={ params }
                      countries={ all_countries }
                      set_params={ params => {
                        this.props.set_params(params)
                        this.props.cleanup_fetch_filter_section_row()
                        this.props.fetch_all_countries(params.date_from, params.date_to)
                        this.props.history.push(`/cohort/${params.date_from}/${params.date_to}/${params.filter}`)
                      } }
                    />
                  </div>
                  <div name="Monthly Reports">
                    <MonthlyReportsControls params={ params }
                      countries={ all_countries }
                      set_params={ params => {
                        this.props.set_params(params)
                        this.props.cleanup_fetch_filter_section_row()
                        this.props.fetch_all_countries(params.date_from, params.date_to)
                        this.props.history.push(`/monthly_reports/${params.date_from}/${params.date_to}/${params.filter}`)
                      } }
                    />
                  </div>
                </SimpleTabs>
              }
             , sequence([this.props.all_countries, this.props.all_affiliates])
            )()
    })(this.props.login_state)
  }
}

export default connect(
    state => ({
        login_state: state.login, params: state.controls
      , all_countries: state.all_countries
      , all_affiliates: state.all_affiliates
    })
  , {
        login, check_loggedin
      , fetch_all_countries
      , fetch_all_affiliates
      , set_params
      , cleanup_fetch_filter_section_row
      // , cleanup_fetch_monthly_reports
      // , cleanup_fetch_converting_ips
      // , cleanup_fetch_cohort
      // , cleanup_fetch_filter_page_section_row
    }
)(Home)
