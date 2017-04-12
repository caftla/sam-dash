import React from 'react'
import R from 'ramda'
import { Submit, DateField, FormTitle, FormRow, FormLabel, FormContainer, FormSection, FilterFormSection, Select } from '../Styled'
import styled from 'styled-components'

const Input = ({type, name, value, onChange} : {type: string, name: string, value: string, onChange: string => void}) =>
  <FormRow>
    <FormLabel>{name}</FormLabel>
    <DateField value={value} type={type} onChange={ x => onChange(x.target.value) } />
  </FormRow>

const InputSelect = ({name, value, options, onChange}) =>
  <FormRow>
    <FormLabel>{name}</FormLabel>
    <Select value={ value } onChange={ e => onChange(e.target.value) }>
      <option value="">Select</option>
      { options.map(c => <option key={ c }>{ c }</option>) }
    </Select>
  </FormRow>

type ControlsProps = {
    params: QueryParams
  , countries: Array<any>
  , set_params: QueryParams => any
}

type ControlsState = {
    date_from: string
  , date_to: string
  , section: string
  , row: string
  , country_code: string
  , operator_code: string
  , affiliate_name: string
  , handle_name: string
}

export default class Controls extends React.Component {
  props: ControlsProps
  state: ControlsState
  constructor(props: ControlsProps) {
    super(props)
    this.state = props.params
  }

  render() {
    const {countries} = this.props
    const get_all_props = prop => R.pipe(
        R.chain(R.prop(prop))
      , R.uniq
      , R.sortBy(x => x)
    )(countries)
    const get_country_prop = prop => R.pipe(
        R.find(x => x.country_code == this.state.country_code)
      , R.prop(prop)
    )(countries)

    console.log('this.state.country_code', this.state.country_code)

    return <FormContainer>
      <FormSection>
        <FormTitle>Date Range:</FormTitle>
        <Input type="date" name="From" value={ this.state.date_from } onChange={ val => this.setState({ 'date_from': val }) } />
        <Input type="date" name="To" value={ this.state.date_to } onChange={ val => this.setState({ 'date_to': val }) } />
      </FormSection>
      <FilterFormSection>
        <FormTitle>Filter:</FormTitle>
        <InputSelect name="Country" onChange={ country_code => this.setState({ country_code: country_code, operator_code: '' }) }
          value={ this.state.country_code } options={ this.props.countries.map(x => x.country_code) } />
        <InputSelect name="Operator" onChange={ operator_code => this.setState({ operator_code }) }
          value={ this.state.operator_code } options={ !this.state.country_code ? [] : get_country_prop('operator_codes') } />
        <InputSelect name="Affiliate" onChange={ affiliate_name => this.setState({ affiliate_name }) }
          value={ this.state.affiliate_name } options={ !this.state.country_code ? get_all_props('affiliate_names') : get_country_prop('affiliate_names') } />
        <InputSelect name="Handle" onChange={ handle_name => this.setState({ handle_name }) }
          value={ this.state.handle_name } options={ !this.state.country_code ? get_all_props('handle_names') : get_country_prop('handle_names') } />
      </FilterFormSection>
      <FormSection>
        <FormTitle>Options:</FormTitle>
        <InputSelect options={ ['affiliate_name', 'publisher_id', 'country_code', 'operator_code', 'handle_name', 'day'] }
            name="Section" value={ this.state.section } onChange={ val => this.setState({ 'section': val }) } />
        <InputSelect options={ ['affiliate_name', 'publisher_id', 'country_code', 'operator_code', 'handle_name', 'day'] }
            name="Row" value={ this.state.row } onChange={ val => this.setState({ 'row': val }) } />
      </FormSection>
      <Submit onClick={ _ => {
        const filter = R.pipe(
            R.map(k => [k, this.state[k]])
          , R.filter(([k, v]) => !!v)
          , R.map(R.join('='))
          , R.join(',')
          , x => !x ? '-' : x
        )(["country_code", "operator_code", "affilaite_name", "handle_name"])
        this.props.set_params({
            date_from: this.state.date_from
          , date_to: this.state.date_to
          , filter: filter
          , section: this.state.section
          , row: this.state.row
        })
      } }>
        Go!
      </Submit>
    </FormContainer>
  }
}
