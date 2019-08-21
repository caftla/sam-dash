// @flow

import React from 'react'
import R from 'ramda'
import type { QueryParams } from 'my-types'
import { Submit, FormTitle, FormRow, FormLabel, FormContainer, FormSection, FormSectionButtons, FilterFormSection, Select } from '../Styled'
import styled from 'styled-components'
import css from '../../../node_modules/react-datetime/css/react-datetime.css'
import stylus from './Controls.styl'
import { InputMultiSelect, LabelledInput, Input, InputSelect, MySimpleSelect, ThemedDateRangePicker } from '../common-controls/FormElementsUtils'
import BreakdownItem from '../common-controls/BreakdownItem'
import { get } from '../../helpers'
const { format } = require('d3-format')
const {timeFormat} = require('d3-time-format')
const format_date = timeFormat('%Y-%m-%dT%H:%M:%S')


const DateTime = ({value, onChange}) => <input 
  onChange={ event => { onChange(new Date(event.target.value)) } } 
  value={ value.split('T')[0] } type='date' />

const api_root = process.env.api_root || '' // in production api_root is the same as the client server
const api_get = (timezone: int, date_from : string, date_to : string, filter : string, page : string, section : string, row : string, nocache: boolean) => 
  {
    return get({ url: `${api_root}/api/v1/user_sessions/${timezone}/${date_from}/${date_to}/${filter}/${page}/${section}/${row}`, nocache})
  }

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
  , country_code: string
  , operator_code: string
  , gateway: string
  , affiliate_name: string
  , ad_name: string
  , handle_name: string
  , scenario_name: string
  , service_identifier1: string
  , publisher_id: string
  , cache_buster_id: string
  , nocache: boolean
  , publisher_ids: Array<string>
  , ab_tests: Array<string>
}

const get_all_props_ = props => (prop: string) => R.pipe(
      R.chain(R.prop(prop))
    , R.uniq
    , R.sortBy(x => x)
  )(props.all_countries)

const ifExists_ = (props, country_code) => (field: string, value: any) => (!country_code || country_code == '-' ? get_all_props_(props)(field) : get_country_prop_(props, country_code)(field, [])).some(e => e == value) ? value : ''

const get_country_prop_ = (props, country_code) => (prop: string, def: any) => R.pipe(
      R.find(x => x.country_code == country_code)
    , x => !x ? def : R.prop(prop)(x)
  )(props.all_countries || [])

const add_time = date => date.indexOf('T') > -1
  ? date
  : date + 'T00:00:00'

const until_today = date => date.indexOf('day') > -1
  ? new Date(new Date().valueOf() + 1 * 1000 * 3600 * 24).toISOString().split('T')[0] + 'T00:00:00'
  : add_time(date)

const find_relative_date = x_days => new Date(new Date().valueOf() - x_days * 1000 * 3600 * 24).toISOString().split('T')[0] + 'T00:00:00'

const since = date => date.indexOf('days') > -1
  ? find_relative_date(parseInt(date))
  : add_time(date)

const filterToObj = R.pipe(
    R.split(',')
  , R.map(R.split('='))
  , R.fromPairs
)

export default class Controls extends React.Component {
  props: ControlsProps
  state: ControlsState
  constructor(props: ControlsProps) {
    super(props)
    this.setProps(props)
  }

  componentWillReceiveProps(props) {
    this.setProps(props)
  }

  setProps(props) {
    const { params } = props
    const filter_params = filterToObj(params.filter || '-')

    const ifExists = ifExists_(props, filter_params.country_code)
    const params_affiliate_ids = !filter_params.affiliate_id ? [] : R.split(';')(filter_params.affiliate_id)

    
    const fix_affiliate_name = breakdown => breakdown == 'affiliate_name' ? 'affiliate_id' : breakdown

    const e_filter_params = R.merge(filter_params, {
        ad_name: ifExists('ad_names', filter_params.ad_name)        
      , handle_name: ifExists('handle_names', filter_params.handle_name)
      , operator_code: ifExists('operator_codes', filter_params.operator_code)
      , gateway: ifExists('gateways', filter_params.gateway)
      , scenario_name: ifExists('scenario_names', filter_params.scenario_name)
      , service_identifier1: ifExists('service_identifier1s', filter_params.service_identifier1)
      , publisher_id: filter_params.publisher_id
      , ab_test: filter_params.ab_test
    })

    this.state = {
        date_from: since(params.date_from)
      , date_to: until_today(params.date_to)
      , from_hour: '0'
      , to_hour: '24'
      , is_relative_date: false
      , relative_date: 0
      , timezone: params.timezone
      , page: fix_affiliate_name(params.page)
      , section: fix_affiliate_name(params.section)
      , row: fix_affiliate_name(params.row)
      , ...e_filter_params
      , publisher_ids: []
      , ab_tests: []
      , nocache: !!params.nocached
      , cache_buster_id: `cb_${Math.round(Math.random() * 100000)}`
      , rowSorter: params.rowSorter
      , sectionSorter: params.sectionSorter
      , tabSorter: params.tabSorter
      , is_relative_date: params.is_relative_date
      , relative_date_from: params.relative_date_from
    }
  }

  componentDidMount() {

  }


  get_filter_string_by_fields(ofields) {
    const fields = ((this.state['from_hour'] == 0 || !this.state['from_hour']) && (this.state['to_hour'] == 24 || !this.state['to_hour']))
      ? R.reject(x => x == 'from_hour' || x == 'to_hour')(ofields)
      : ofields
      
    // filter params without control
    const fields_with_affiliate_id = fields.concat(['affiliate_id'])
    const extra_filter_params = R.pipe(
      R.toPairs
      , R.filter(([k, v]) => fields_with_affiliate_id.indexOf(k) < 0)
    )(filterToObj(this.props.params.filter))

    const affiliate_ids = R.pipe(
        R.filter(x => (this.state.affiliate_name || '').split(';').some(a => a == x.affiliate_name))
      , R.map(x => x.affiliate_ids)
      , R.chain(x => x)
      , R.join(';')
    )(this.props.all_affiliates)
    
    return R.pipe(
        R.map(k => [k, this.state[k]])
      , R.unionWith(R.eqBy(R.prop('0')), R.__, extra_filter_params)
      , R.reject(([key, value]) => !value || value == '-')
      , R.map(R.join('='))
      , R.join(',')
      , x => !x ? '-' : x
      , y => y.replace(/\//g, '%2F')
    )(fields) + (!affiliate_ids ? '' : `,affiliate_id=${affiliate_ids}`)
	}

  get_filter_string() {
    
    const with_publisher_id = this.state.publisher_ids.some(p => p == this.state.publisher_id)
    const controlled_fields = ["country_code", "operator_code", "gateway", "ad_name", "handle_name", "scenario_name", "service_identifier1", "ab_test", "from_hour", "to_hour"]
      .concat(with_publisher_id ? ["publisher_id"] : [])

    return this.get_filter_string_by_fields(controlled_fields)
  }

  render() {
    const {countries, affiliates} = this.props
    const get_all_props = get_all_props_(this.props)
    const get_country_prop = get_country_prop_(this.props, this.state.country_code)


    const get_options = (field) =>  {
      return !this.state.country_code || this.state.country_code == '-' ? get_all_props(field) : R.pipe(
        R.map(c => get_country_prop_(this.props, c)(field, []))
      , R.flatten
      , R.uniq
      )(this.state.country_code.split(';'))
    }
    
    const makeLens = p => R.lens(R.prop(p), (a, s) => typeof a != 'undefined' && a != null ? R.merge(s, R.assoc(p)(a, s)) : s)
    const overState = (p, val) => 
      R.over(makeLens(p), R.always(val))

    return <FormContainer className={this.props.className}>
      <FormSection className="date-filter">
        <FormTitle>Date Range</FormTitle>
        <LabelledInput name="From">
          <DateTime value={this.state.date_from} onChange={val => {
            if (!!val.toJSON) {
              this.setState({ 'date_from': format_date(val) })
            } else {
              // wrong date
            }
          }} inputProps={{
            className: 'date_input'
          }} />
        </LabelledInput>
        <LabelledInput name="To">
          <DateTime value={this.state.date_to} onChange={val => {
            if (!!val.toJSON) {
              this.setState({ 'date_to': format_date(val) })
            } else {
              // wrong date
            }
          }} inputProps={{
            className: 'date_input'
          }} />
        </LabelledInput>
      </FormSection>
      <MySimpleSelect name="Country" onChange={ country_code => this.setState({ country_code: country_code }) }
          value={ this.state.country_code } options={ (this.props.all_countries || []).map(x => x.country_code) } required />
      <InputSelect name="Gateway" onChange={ gateway => this.setState({ gateway }) }
          value={ this.state.gateway } options={ !this.state.country_code || this.state.country_code == '-' ? [] : get_country_prop('gateways', []) } />
      <InputSelect name="Operator" onChange={ operator_code => this.setState({ operator_code }) }
          value={ this.state.operator_code } options={ !this.state.country_code || this.state.country_code == '-' ? [] : get_country_prop('operator_codes', []) } />
      <InputSelect name="Service Identifier 1" onChange={ service_identifier1 => this.setState({ service_identifier1 }) }
          value={ this.state.service_identifier1 } options={ !this.state.country_code || this.state.country_code == '-' ? [] : get_country_prop('service_identifier1s', []) } />
      <FormSectionButtons>
        <Submit onClick={_ => {
          this.props.set_params({
            date_from: this.state.date_from.split('T')[0]
            , date_to: this.state.date_to.split('T')[0]
            , timezone: this.state.timezone
            , filter: this.get_filter_string()
            , nocache: this.state.nocache
            , resolution: this.props.params.resolution
            , cohort: this.props.params.cohort
          })
        }}>
          GO
        </Submit>
      </FormSectionButtons>
    </FormContainer>
  }
}