// @flow

import React from 'react'
import R from 'ramda'
import type { QueryParams } from 'my-types'
import { Submit, DateField, NumberField, FormTitle, FormRow, FormLabel, FormContainer, FormSection, FormSectionButtons, FilterFormSection, Select } from '../Styled'
import styled from 'styled-components'
import DateTime from 'react-datetime'
import css from '../../../node_modules/react-datetime/css/react-datetime.css'
import stylus from './Controls.styl'
const {timeFormat} = require('d3-time-format')
const { format } = require('d3-format')

const format_date = timeFormat('%Y-%m-%dT%H:%M:%S')

const Input = ({type, name, value, onChange, style} : {type: string, name: string, value: string, onChange: string => void}) =>
  <FormRow>
    <FormLabel>{name}</FormLabel>
    <DateField value={value} type={type} onChange={ x => onChange(x.target.value) } style={ style || {} } />
  </FormRow>

const LabelledInput = ({name, children} : {name: string, children?: Array<any>}) =>
  <FormRow>
    <FormLabel>{name}</FormLabel>
    { children }
  </FormRow>

const InputSelect = ({name, value, options, onChange}) =>
  <FormRow>
    <FormLabel>{name}</FormLabel>
    <Select value={ value } onChange={ e => onChange(e.target.value) }>
      <option value="-">Select</option>
      { options.map((c, i) => <option key={ i } value={ !!c && c.hasOwnProperty('value') ? c.value : c }>{ !!c && c.hasOwnProperty('name') ? c.name : c }</option>) }
    </Select>
  </FormRow>

const CheckBoxDiv = styled.div`
  transform: ${props => props.theme.checkBoxDivTransform || 'translate(-32%,0) scale(1.5)'}
`

type ControlsProps = {
    params: QueryParams
  , countries: Array<any>
  , affiliates: Array<any>
  , set_params: QueryParams => any
  , set_min: (string, number) => any
  , className?: string
}

type ControlsState = {
    date_from: string
  , date_to: string
  , timezone: number
  , page: string
  , section: string
  , row: string
  , country_code: string
  , operator_code: string
  , affiliate_name: string
  , handle_name: string
  , cache_buster_id: string
  , nocache: boolean
}

export default class Controls extends React.Component {
  props: ControlsProps
  state: ControlsState
  constructor(props: ControlsProps) {
    super(props)
    const { params } = props
    const filter_params = R.pipe(
        R.split(',')
      , R.map(R.split('='))
      , R.fromPairs
    )(params.filter || '-')

    const params_affiliate_ids = !filter_params.affiliate_id ? [] : R.split(';')(filter_params.affiliate_id)
    const affiliate_name = params_affiliate_ids.length == 0 ? '' : R.pipe(
        x => x[0]
      , affiliate_id => R.pipe(
          R.find(x => x.affiliate_ids.some(a => a == affiliate_id))
        , x => !x ? '' : x.affiliate_name
      )(props.affiliates)
    )(params_affiliate_ids)

    const add_time = date => date.indexOf('T') > -1
      ? date
      : date + 'T00:00:00'


    const fix_affiliate_name = breakdown => breakdown == 'affiliate_name' ? 'affiliate_id' : breakdown

    this.state = {
        date_from: add_time(params.date_from)
      , date_to: add_time(params.date_to)
      , timezone: params.timezone
      , page: fix_affiliate_name(params.page)
      , section: fix_affiliate_name(params.section)
      , row: fix_affiliate_name(params.row)
      , ...filter_params
      , affiliate_name
      , nocache: !!params.nocache
      , cache_buster_id: `cb_${Math.round(Math.random() * 100000)}`
    }
  }

  get_filter_string(with_publisher_id: boolean) {
    const affiliate_ids = R.pipe(
        R.filter(x => x.affiliate_name == this.state.affiliate_name)
      , R.map(x => x.affiliate_ids)
      , R.chain(x => x)
      , R.join(';')
    )(this.props.affiliates)
    return R.pipe(
        R.map(k => [k, this.state[k]])
      , R.reject(([key, value]) => !value || value == '-')
      , R.map(R.join('='))
      , R.join(',')
      , x => !x ? '-' : x
    )(["country_code", "operator_code", "handle_name"].concat(with_publisher_id ? ["publisher_id", "sub_id"] : [])) + (!affiliate_ids ? '' : `,affiliate_id=${affiliate_ids}`)
  }

  render() {
    const {countries, affiliates} = this.props
    const get_all_props = prop => R.pipe(
        R.chain(R.prop(prop))
      , R.uniq
      , R.sortBy(x => x)
    )(countries)
    const get_country_prop = (prop, def) => R.pipe(
        R.find(x => x.country_code == this.state.country_code)
      , x => !x ? def : R.prop(prop)(x)
    )(countries)

    const breakdown_list = [ 'affiliate_id', 'publisher_id', 'sub_id', 'country_code', 'operator_code', 'handle_name', 'product_type', 'device_class', 'gateway', 'hour', 'day', 'week', 'month']

    return <FormContainer className={ this.props.className }>
    
      {/*@Justin: you can add className to any of these elements*/}
      
      <FormSection className="date-filter">
        <FormTitle>Date Range</FormTitle>
        <LabelledInput name="From">
          <DateTime value={ new Date(this.state.date_from) } onChange={ val => {
              if(!!val.toJSON) {
                this.setState({ 'date_from': format_date(val.toDate()) })
              } else {
                // wrong date
              }
            } } inputProps={ {
              className: 'date_input'
            } } />
        </LabelledInput>
        <LabelledInput name="To">
          <DateTime value={ new Date(this.state.date_to) } onChange={ val => {
              if(!!val.toJSON) {
                this.setState({ 'date_to': format_date(val.toDate()) })
              } else {
                // wrong date
              }
            } } inputProps={ {
              className: 'date_input'
            } } />
        </LabelledInput>
        <InputSelect name="Timezone" onChange={ timezone => {
          console.log('setting_timezone', timezone)
          this.setState({ timezone: timezone }) 
        }}
          value={ this.state.timezone } options={ 
            R.pipe(
                R.map(x => (12 - x / 2) )
              , R.sortBy(x => x)
              , R.map(x => ({value: x, name: `UTC${format("+.1f")(x)}`}))
            )(R.range(0, 48)) 
          } />
      </FormSection>
      <FilterFormSection>
        <FormTitle>Filter</FormTitle>
        <InputSelect name="Country" onChange={ country_code => this.setState({ country_code: country_code, operator_code: '' }) }
          value={ this.state.country_code } options={ this.props.countries.map(x => x.country_code) } />
        <InputSelect name="Operator" onChange={ operator_code => this.setState({ operator_code }) }
          value={ this.state.operator_code } options={ !this.state.country_code ? [] : get_country_prop('operator_codes', []) } />
        <InputSelect name="Affiliate" onChange={ affiliate_name => this.setState({ affiliate_name }) }
          value={ this.state.affiliate_name } options={ !this.state.country_code ? get_all_props('affiliate_names') : get_country_prop('affiliate_names', []) } />
        <InputSelect name="Handle" onChange={ handle_name => this.setState({ handle_name }) }
          value={ this.state.handle_name } options={ !this.state.country_code ? get_all_props('handle_names') : get_country_prop('handle_names', []) } />
        <LabelledInput name="Sales" style={{ width: '40px' }}>
          <NumberField type="number" value={ this.props.sort.rowSorter.minSales } onChange={ x => {
            this.props.set_min('sales', parseInt(x.target.value))
            } } />
        </LabelledInput>
        <LabelledInput name="Views" style={{ width: '40px' }}>
          <NumberField value={ this.props.sort.rowSorter.minViews } type="number" onChange={ x => {
            this.props.set_min('views', parseInt(x.target.value))
            } } />
        </LabelledInput>
      </FilterFormSection>
      <FormSection>
        <FormTitle>Breakdown</FormTitle>
        <InputSelect options={ breakdown_list }
            name="Tabs" value={ this.state.page } onChange={ val => this.setState({ 'page': val }) } />
        <InputSelect options={ breakdown_list }
            name="Section" value={ this.state.section } onChange={ val => this.setState({ 'section': val }) } />
        <InputSelect options={ breakdown_list }
            name="Row" value={ this.state.row } onChange={ val => this.setState({ 'row': val }) } />
      </FormSection>
      <FormSectionButtons>
      <CheckBoxDiv>
        <label htmlFor={ this.state.cache_buster_id }>No cache</label><input 
          checked={ this.state.nocache } 
          onChange={ e => this.setState({ nocache: !!e.target.checked }) }
          id={ this.state.cache_buster_id } type="checkbox" />
      </CheckBoxDiv>
      <Submit onClick={ _ => {
        const filter = R.pipe(
            R.map(k => [k, this.state[k]])
          , R.filter(([k, v]) => !!v)
          , R.map(R.join('='))
          , R.join(',')
          , x => !x ? '-' : x
        )(["country_code", "operator_code", "affiliate_name", "handle_name"])
        this.props.set_params({
            date_from: this.state.date_from
          , date_to: this.state.date_to
          , timezone: this.state.timezone
          , filter: this.get_filter_string(false)
          , page: this.state.page
          , section: this.state.section
          , row: this.state.row
          , nocache: this.state.nocache
        })
      } }>
        GO
      </Submit>
      </FormSectionButtons>
    </FormContainer>
  }
}