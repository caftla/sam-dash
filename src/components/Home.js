// @flow

import React from 'react'
import { connect } from 'react-redux'
import { Redirect } from 'react-router'

import { Submit, DateField, FormTitle, FormRow, FormLabel, FormContainer, FormSection, Select } from './Styled'

import type { QueryParams } from 'my-types'
import { set_params, get_countries, cleanup_fetch_filter_section_row } from '../actions'
import { toQueryString } from '../helpers'

import * as maybe from 'flow-static-land/lib/Maybe'
import type { Maybe } from 'flow-static-land/lib/Maybe'

const Input = ({type, name, value, onChange} : {type: string, name: string, value: string, onChange: string => void}) =>
  <FormRow>
    <FormLabel>{name}</FormLabel>
    <DateField value={value} type={type} onChange={ x => onChange(x.target.value) } />
  </FormRow>

const InputSelect = ({name, value, options, onChange}) =>
  <FormRow>
    <FormLabel>{name}</FormLabel>
    <Select value={ value } onChange={ e => onChange(e.target.value) }>
      { options.map(c => <option key={ c }>{ c }</option>) }
    </Select>
  </FormRow>

type ControlsProps = {
    params: QueryParams
  , countries: Array<string>
  , set_params: QueryParams => any
}
class Controls extends React.Component {
  props: ControlsProps
  state: QueryParams
  constructor(props: ControlsProps) {
    super(props)
    this.state = props.params
  }

  render() {
    return <FormContainer>

      <FormSection>
        <FormTitle>Date Range:</FormTitle>
        <Input type="date" name="From" value={ this.state.date_from } onChange={ val => this.setState({ 'date_from': val }) } />
        <Input type="date" name="To" value={ this.state.date_to } onChange={ val => this.setState({ 'date_to': val }) } />
      </FormSection>
      <FormSection>
        <FormTitle>Options:</FormTitle>
        <Input type="text" name="Filter" value={ this.state.filter } onChange={ val => this.setState({ 'filter': val }) } />
        <InputSelect options={ ['affiliate_name', 'publisher_id', 'country_code', 'operator_code', 'day'] }
            name="Section" value={ this.state.section } onChange={ val => this.setState({ 'section': val }) } />
        <InputSelect options={ ['affiliate_name', 'publisher_id', 'country_code', 'operator_code', 'day'] }
            name="Row" value={ this.state.row } onChange={ val => this.setState({ 'row': val }) } />
      </FormSection>
      <Submit onClick={ _ => this.props.set_params(this.state) }>
        Go!
      </Submit>
    </FormContainer>
  }
}

type HomeProps = {
    params: QueryParams
  , maybe_countries: Maybe<Array<string>>
  , set_params: QueryParams => void
  , get_countries: () => void
  , cleanup_fetch_filter_section_row: () => void
}
class Home extends React.Component {
  props: HomeProps
  state: { is_set: bool }

  constructor(props: HomeProps) {
    super(props)
    console.log('Home', props)
    this.state = { is_set: false }
  }

  render() {

    const { params } = this.props
    return this.state.is_set
      ? this.props.cleanup_fetch_filter_section_row() &&
        <Redirect push to={ `/filter_section_row/${params.date_from}/${params.date_to}/${params.filter}/${params.section}/${params.row}` } />
      : <Controls
          params={ this.props.params }
          countries={ [] }
          set_params={ v => {
            this.props.set_params(v);
            const self = this
            setTimeout(() => self.setState({ is_set: true }), 30)
          } }
        />
  }
}


export default connect(state => ({ params: state.controls  }), { set_params, get_countries, cleanup_fetch_filter_section_row })(Home)
