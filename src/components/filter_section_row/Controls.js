import React from 'react'
import { Submit, DateField, FormTitle, FormRow, FormLabel, FormContainer, FormSection, Select } from '../Styled'

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
  , set_params: QueryParams => any
}

export default class Controls extends React.Component {
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
        <FormTitle>Filter:</FormTitle>
        <Input type="text" name="" value={ this.state.filter } onChange={ val => this.setState({ 'filter': val }) } />
      </FormSection>
      <FormSection>
        <FormTitle>Options:</FormTitle>
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
