// @flow

import React from 'react'
import R from 'ramda'
import type { QueryParams } from 'my-types'
import { Submit, DateField, NumberField, FormTitle, FormRow, FormLabel, FormContainer, FormSection, FormSectionButtons, FilterFormSection, Select } from '../Styled'
import styled from 'styled-components'
import css from '../../../node_modules/react-datetime/css/react-datetime.css'
import stylus from './Controls.styl'
import { Input, LabelledInput, InputSelect, InputMultiSelect } from '../common-controls/FormElementsUtils'
import BreakdownItem from '../common-controls/BreakdownItem'
import { get } from '../../helpers'
const {timeFormat} = require('d3-time-format')
const { format } = require('d3-format')

const DateTime = ({value, onChange, disabled, readonly}) => <input 
  disabled={ disabled } readonly={ readonly }
  onChange={ event => { onChange(new Date(event.target.value)) } } 
  value={ value } type='datetime-local' />

const api_root = process.env.api_root || '' // in production api_root is the same as the client server
const api_get = (timezone: int, date_from : string, date_to : string, filter : string, page : string, section : string, row : string, nocache: boolean) => 
  get({url: `${api_root}/api/v1/filter_page_section_row/${timezone}/${date_from}/${date_to}/${filter}/${page}/${section}/${row}`, nocache})

const format_date = timeFormat('%Y-%m-%dT%H:%M:%S')

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
}

const get_all_props_ = props => (prop: string) => R.pipe(
      R.chain(R.prop(prop))
    , R.uniq
    , R.sortBy(x => x)
  )(props.countries)

const ifExists_ = (props, country_code) => (field: string, value: any) => (
  !country_code || country_code == '-' 
    ? get_all_props_(props)(field) 
    : R.pipe( R.map(c => get_country_prop_(props, c)(field, [])), R.flatten )(country_code.split(';'))
  ).some(e => !value ? false : value.split(';').some(v => v == e)) ? value : ''

const get_country_prop_ = (props, country_code) => (prop: string, def: any) => R.pipe(
      R.find(x => x.country_code == country_code)
    , x => !x ? def : R.prop(prop)(x)
  )(props.countries)

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
    const filter_params = R.pipe(
        R.split(',')
      , R.map(R.split('='))
      , R.fromPairs
    )(params.filter || '-')

    const ifExists = ifExists_(props, filter_params.country_code)
    const params_affiliate_ids = !filter_params.affiliate_id ? [] : R.split(';')(filter_params.affiliate_id)
    const affiliate_name = params_affiliate_ids.length == 0 ? '' :  R.pipe(
        affiliate_ids => R.pipe(
            R.filter(x => x.affiliate_ids.some(a => affiliate_ids.some(i => i == a)))
          , xs => !xs ? '' : xs.map(x => x.affiliate_name).join(';')
        )(props.affiliates)
      )(params_affiliate_ids)
    
    
    const fix_affiliate_name = breakdown => breakdown == 'affiliate_name' ? 'affiliate_id' : breakdown

    const e_filter_params = R.merge(filter_params, {
        ad_name: ifExists('ad_names', filter_params.ad_name)        
      , handle_name: ifExists('handle_names', filter_params.handle_name)
      , operator_code: ifExists('operator_codes', filter_params.operator_code)
      , gateway: ifExists('gateways', filter_params.gateway)
      , scenario_name: ifExists('scenario_names', filter_params.scenario_name)
      , service_identifier1: ifExists('service_identifier1s', filter_params.service_identifier1)
      , publisher_id: filter_params.publisher_id
    })

    this.state = {
        date_from: since(params.date_from)
      , date_to: until_today(params.date_to)
      , relative_date: 0
      , timezone: params.timezone
      , page: fix_affiliate_name(params.page)
      , section: fix_affiliate_name(params.section)
      , row: fix_affiliate_name(params.row)
      , ...e_filter_params
      , publisher_ids: []
      , affiliate_name
      , nocache: !!params.nocache
      , cache_buster_id: `cb_${Math.round(Math.random() * 100000)}`
      , rowSorter: params.rowSorter
      , sectionSorter: params.sectionSorter
      , tabSorter: params.tabSorter
      , is_relative_date: params.is_relative_date || false
      , relative_date_from: params.relative_date_from
    }

    this.reload_publisher_ids()
  }

  reload_publisher_ids() {
    if(!!this.state.affiliate_name && this.state.affiliate_name != '-' && this.state.affiliate_name.split(';').length == 1) {
      // only fetch publishers if one affiliate is selected
      api_get(this.state.timezone, this.state.date_from, this.state.date_to, this.get_filter_string_by_fields(['country_code', 'operator_code']), '-', '-', 'publisher_id', false)
      .then(R.pipe(
          R.chain(x => x.data)
        , R.chain(x => x.data)
        , R.sortBy(x => x.sales * -1)
        , R.map(x => x.row)
        , R.take(256)
        , publisher_ids => this.setState({ publisher_ids })
      )) 
    } else {
      this.setState({ publisher_ids: [] })
    }
  }

  get_filter_string_by_fields(fields) {
    const affiliate_ids = R.pipe(
        R.filter(x => this.state.affiliate_name.split(';').some(a => a == x.affiliate_name))
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
      , y => y.replace(/\//g, '%2F')
    )(fields) + (!affiliate_ids ? '' : `,affiliate_id=${affiliate_ids}`)
	}

  get_filter_string() {
    const with_publisher_id = this.state.publisher_ids.some(p => p == this.state.publisher_id)
    return this.get_filter_string_by_fields(["country_code", "operator_code", "gateway", "ad_name", "handle_name", "scenario_name", "service_identifier1"].concat(with_publisher_id ? ["publisher_id"] : []))
  }

  render() {
    const {countries, affiliates} = this.props
    const get_all_props = get_all_props_(this.props)
    const get_country_prop = get_country_prop_(this.props, this.state.country_code)

    const breakdown_list = [ 'affiliate_id', 'publisher_id', 'sub_id', 'gateway', 'country_code', 'operator_code', 'handle_name', 'ad_name', 'scenario_name', 'product_type', 'service_identifier1', 'service_identifier2', 'device_class', 'hour', 'day', 'week', 'month']

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

    return <FormContainer className={ this.props.className }>      
      <FormSection className="date-filter">
        <FormTitle>Date Range</FormTitle>
        <LabelledInput name="From">
					<DateTime value={ this.state.is_relative_date === true ? 'Relative date selected' : this.state.date_from } 
						onChange={ val => {
              if(!!val.toJSON) {
                this.setState({ 'date_from': format_date(val) })
              } else {
                // wrong date
              }
            } }
						disabled={ `${this.state.is_relative_date === true ? 'disabled' : ''}` }
            />
        </LabelledInput>
        <LabelledInput name="To">
					<DateTime value={ this.state.is_relative_date === true ? 'Relative date selected' : this.state.date_to } 
						onChange={ val => {
              if(!!val.toJSON) {
                this.setState({ 'date_to': format_date(val) })
              } else {
                // wrong date
              }
            } }
            disabled={ `${this.state.is_relative_date === true ? 'disabled' : ''}` }
            />
        </LabelledInput>
        <InputSelect className='timezone' name="Timezone" 
          onChange={ timezone => this.setState({ timezone: timezone }) }
          value={ this.state.timezone } options={ 
            R.pipe(
                R.map(x => (12 - x / 2) )
              , R.sortBy(x => x)
              , R.map(x => ({value: x, name: `UTC${format("+.1f")(x)}`}))
            )(R.range(0, 48)) 
          } />
        {/*<CheckBoxDiv>
          <label>Relative Date</label><input 
            checked={ this.state.is_relative_date } 
            onChange={ e => this.setState({ is_relative_date: !!e.target.checked }) }
            id={ this.state.cache_buster_id } type="checkbox" />
        </CheckBoxDiv>
          <InputSelect name="Last" disable={ !this.state.is_relative_date } onChange={ relative_date => this.setState({ date_from: relative_date, date_to: 'today' }) }
          value={ this.state.relative_date_from } options={ 
            R.pipe(
                R.map(x => (x + 1) )
              , R.sortBy(x => x)
              , R.map(x => ({value: `${x}-days-ago`, name: `${x} days`}))
            )(R.range(1, 31)) 
          } />
        */}
      </FormSection>
      <FilterFormSection>
        <FormTitle>Filter</FormTitle>
        <InputMultiSelect name="Country"
          onChange={ country_code => { 
            return this.setState({ 
                country_code: country_code
              , operator_code: ''
              , affiliate_name: ifExists_(this.props, country_code)('affiliate_names', this.state.affiliate_name)
              , handle_name: ifExists_(this.props, country_code)('handle_names', this.state.handle_name)
            }) } }
          value={ this.state.country_code } options={ this.props.countries.map(x => x.country_code) } />
        <InputSelect name="Operator" 
          onChange={ operator_code => this.setState({ operator_code }) }
          value={ this.state.operator_code } options={ !this.state.country_code || this.state.country_code == '-' ? [] : get_country_prop('operator_codes', []) } />
        <InputSelect name="Gateway" 
          onChange={ gateway => this.setState({ gateway }) }
          value={ this.state.gateway } options={ !this.state.country_code || this.state.country_code == '-' ? [] : get_country_prop('gateways', []) } />
        <InputMultiSelect name="Affiliate" onChange={ affiliate_name => 
            this.setState({ affiliate_name, publisher_ids: [] }, () => this.reload_publisher_ids()) 
          }
          value={ this.state.affiliate_name } options={ get_options('affiliate_names') } />
        <InputSelect name="Publisher" onChange={ publisher_id => this.setState({ publisher_id }) }
          disable={ this.state.affiliate_name.split(';').length > 1 }
          value={ this.state.publisher_id } options={ this.state.publisher_ids || [] } />
        <InputSelect name="Ad Name" onChange={ ad_name => this.setState({ ad_name }) }
          value={ this.state.ad_name } options={ get_options('ad_names') } />
        <InputSelect name="Handle" onChange={ handle_name => this.setState({ handle_name }) }
          value={ this.state.handle_name } options={ get_options('handle_names') } />
        <InputSelect name="Scenario" onChange={ scenario_name => this.setState({ scenario_name }) }
          value={ this.state.scenario_name }  options={ !this.state.country_code || this.state.country_code == '-' ? [] : get_country_prop('scenario_names', []) } />
        <InputSelect name="Service Identifier 1" onChange={ service_identifier1 => this.setState({ service_identifier1 }) }
          value={ this.state.service_identifier1 } options={ !this.state.country_code || this.state.country_code == '-' ? [] : get_country_prop('service_identifier1s', []) } />
      </FilterFormSection>
      <FormSection>
        <FormTitle>Breakdown</FormTitle>

        
        <BreakdownItem 
            label="Tab"
            breakdownList={ breakdown_list }
            onChange={ ({breakDownLevel, sorter}) => this.setState(R.compose(overState('page', breakDownLevel), overState('tabSorter', sorter))) }
            breakDownLevel='page'
            breakDownLevelName={ this.state.page }
            sorter={ this.state.tabSorter }
          / >
        
        <BreakdownItem 
            label="Section"
            breakdownList={ breakdown_list }
            onChange={ ({breakDownLevel, sorter}) => this.setState(R.compose(overState('section', breakDownLevel), overState('sectionSorter', sorter))) }
            breakDownLevel='section'
            breakDownLevelName={ this.state.section }
            sorter={ this.state.sectionSorter }
          / >

        <BreakdownItem 
            label="Row"
            breakdownList={ breakdown_list }
            onChange={ ({breakDownLevel, sorter}) => this.setState(R.compose(overState('row', breakDownLevel), overState('rowSorter', sorter))) }
            breakDownLevel='row'
            breakDownLevelName={ this.state.row }
            sorter={ this.state.rowSorter }
          / >

      </FormSection>
      <FormSectionButtons>
      <CheckBoxDiv>
        <label htmlFor={ this.state.cache_buster_id }>No cache</label><input 
          checked={ this.state.nocache } 
          onChange={ e => this.setState({ nocache: !!e.target.checked }) }
          id={ this.state.cache_buster_id } type="checkbox" />
      </CheckBoxDiv>
      <Submit onClick={ _ => {

        this.props.set_params({
            date_from: this.state.date_from
          , date_to: this.state.date_to
          , timezone: this.state.timezone
          , filter: this.get_filter_string()
          , page: this.state.page
          , section: this.state.section
          , row: this.state.row
          , nocache: this.state.nocache
          , tabSorter: this.state.tabSorter
          , sectionSorter: this.state.sectionSorter
          , rowSorter: this.state.rowSorter
          , is_relative_date: this.state.is_relative_date
          , relative_date_from: this.state.relative_date_from
        })
      } }>
        GO
      </Submit>
      </FormSectionButtons>
    </FormContainer>
  }
}