// @flow

import React from 'react'
import { connect } from 'react-redux'
import { Redirect } from 'react-router'

import Controls  from './filter_section_row/Controls'

import type { QueryParams } from 'my-types'
import { fetch_all_countries, set_params, cleanup_fetch_filter_section_row } from '../actions'

import * as maybe from 'flow-static-land/lib/Maybe'
import type { Maybe } from 'flow-static-land/lib/Maybe'

import { Submit, DateField, FormTitle, FormRow, FormLabel, FormContainer, FormSection, FilterFormSection, Select } from './Styled'

type LoginProps = {
  onLoggedIn: () => void
}

type LoginState = {
    password: string
  , invalid_password: boolean
}

class Login extends React.Component {

  state: LoginState
  props: LoginProps

  constructor(props) {
    super(props)
    this.state = {
        password: ''
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
          <FormLabel>Password</FormLabel>
          <DateField type="password" onChange={ e => this.setState({ password: e.target.value }) } />
        </FormRow>
        { invalid_password_component }
        <FormRow>
          <Submit onClick={ () => {
            if(this.state.password != 'dashsam42') {
              this.setState({ invalid_password: true })
            } else {
              this.props.onLoggedIn()
            }
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
  , history: any
}

type HomeState = {
  logged_in: boolean
}

class Home extends React.Component {

  state: HomeState
  props: HomeProps

  constructor(props: HomeProps) {
    super(props)
    console.log('Home', props)
    this.state = {
      logged_in: 'true' == localStorage.getItem('logged_in')
    }
  }

  render() {
    const { params } = this.props

    return !this.state.logged_in
      ? <Login onLoggedIn={ () => {
        this.setState({ logged_in: true })
        localStorage.setItem('logged_in', 'true')
      } } />
      : <div>
        {process.env.connection_string}
        {
          maybe.maybe(
            _ => {
              this.props.fetch_all_countries(params.date_from, params.date_to)
              return <div>Loading...</div>
            }
           , all_countries => _ => {
              return  <Controls params={ params }
                countries={ all_countries }
                set_params={ params => {
                  this.props.set_params(params)
                  this.props.cleanup_fetch_filter_section_row()
                  this.props.fetch_all_countries(params.date_from, params.date_to)
                  this.props.history.push(`/filter_section_row/${params.date_from}/${params.date_to}/${params.filter}/${params.section}/${params.row}`)
                } }
              />
            }
           , this.props.all_countries
        )()
        }
      </div>
  }
}

export default connect(
    state => ({ params: state.controls, all_countries: state.all_countries  })
  , { fetch_all_countries, set_params, cleanup_fetch_filter_section_row }
)(Home)
