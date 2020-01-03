// @flow

import React from 'react'
import R from 'ramda'
import type { QueryParams } from 'my-types'
import { Submit, DateField, NumberField, FormTitle, FormRow, FormLabel, FormContainer, FormSection, FormSectionButtons, FilterFormSection, Select } from '../Styled'
import styled from 'styled-components'
import stylus from './Controls.styl'
import { InputSelect, ThemedDateRangePicker } from '../common-controls/FormElementsUtils'
import BreakdownItem from '../common-controls/BreakdownItem'
const { format } = require('d3-format')


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
  , ad_name: string
  , handle_name: string
  , scenario_name: string
  , service_identifier1: string
  , cache_buster_id: string
  , nocache: boolean
}

const get_all_props_ = props => (prop: string) => R.pipe(
      R.chain(R.prop(prop))
    , R.uniq
    , R.sortBy(x => x)
  )(props.countries)

const ifExists_ = (props, country_code) => (field: string, value: any) => (!country_code || country_code == '-' ? get_all_props_(props)(field) : get_country_prop_(props, country_code)(field, [])).some(e => e == value) ? value : ''

const get_country_prop_ = (props, country_code) => (prop: string, def: any) => R.pipe(
      R.find(x => x.country_code == country_code)
    , x => !x ? def : R.prop(prop)(x)
  )(props.countries)

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
    const affiliate_name = ifExists('affiliate_names', 
      params_affiliate_ids.length == 0 ? '' : R.pipe(
          x => x[0]
        , affiliate_id => R.pipe(
            R.find(x => x.affiliate_ids.some(a => a == affiliate_id))
          , x => !x ? '' : x.affiliate_name
        )(props.affiliates)
      )(params_affiliate_ids)
    )

    const add_time = date => date.indexOf('T') > -1
      ? date
      : date + 'T00:00:00'


    const fix_affiliate_name = breakdown => breakdown == 'affiliate_name' ? 'affiliate_id' : breakdown

    const e_filter_params = R.merge(filter_params, {
        ad_name: ifExists('ad_names', filter_params.ad_name)        
      , handle_name: ifExists('handle_names', filter_params.handle_name)
      , operator_code: ifExists('operator_codes', filter_params.operator_code)
      , gateway: ifExists('gateways', filter_params.gateway)
      , scenario_name: ifExists('scenario_names', filter_params.scenario_name)
      , service_identifier1: ifExists('service_identifier1s', filter_params.service_identifier1)
    })

    this.state = {
        date_from: add_time(params.date_from)
      , date_to: add_time(params.date_to)
      , timezone: params.timezone
      , page: fix_affiliate_name(params.page)
      , section: fix_affiliate_name(params.section)
      , row: fix_affiliate_name(params.row)
      , ...e_filter_params
      , nocache: !!params.nocache
      , cache_buster_id: `cb_${Math.round(Math.random() * 100000)}`
      , rowSorter: params.rowSorter
      , sectionSorter: params.sectionSorter
      , tabSorter: params.tabSorter
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
      , y => y.replace(/\//g, '%2F')
    )(["country_code", "operator_code", "gateway", "service_identifier1"])
  }

  render() {
    const {countries, affiliates} = this.props
    const get_all_props = get_all_props_(this.props)
    const get_country_prop = get_country_prop_(this.props, this.state.country_code)

    const breakdown_list = [ 'gateway', 'country_code', 'operator_code', 'operator*gateway', 'service_identifier1', 'service_identifier2', 'shortcode*keyword', 'tariff', 'dnstatus_code', 'dnstatus_detail', 'hour', 'day', 'week', 'month']

    const get_options = (field) => 
      !this.state.country_code || this.state.country_code == '-' ? get_all_props(field) : get_country_prop(field, [])
    
    const makeLens = p => R.lens(R.prop(p), (a, s) => typeof a != 'undefined' && a != null ? R.merge(s, R.assoc(p)(a, s)) : s)
    const overState = (p, val) => 
      R.over(makeLens(p), R.always(val))

    return <FormContainer className={ this.props.className }>      
      <FormSection className="date-filter">
        <FormTitle>Date Range</FormTitle>
        <FormRow className='date_picker'>
          <ThemedDateRangePicker self={this} />
        </FormRow>
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
        <InputSelect name="Country" onChange={ country_code => this.setState({ 
              country_code: country_code
            , operator_code: ''
            , affiliate_name: ifExists_(this.props, country_code)('affiliate_names', this.state.affiliate_name)
            , handle_name: ifExists_(this.props, country_code)('handle_names', this.state.handle_name)
          }) }
          value={ this.state.country_code } options={ this.props.countries.map(x => x.country_code) } />
        <InputSelect name="Operator" onChange={ operator_code => this.setState({ operator_code }) }
          value={ this.state.operator_code } options={ !this.state.country_code || this.state.country_code == '-' ? [] : get_country_prop('operator_codes', []) } />
        <InputSelect name="Gateway" onChange={ gateway => this.setState({ gateway }) }
          value={ this.state.gateway } options={ get_options('gateways') } />
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
        const filter = R.pipe(
            R.map(k => [k, this.state[k]])
          , R.filter(([k, v]) => !!v)
          , R.map(R.join('='))
          , R.join(',')
          , x => !x ? '-' : x
        )(["country_code", "operator_code", "gateway", "service_identifier1"])
        const params = {
          date_from: this.state.date_from.split('T')[0]
        , date_to: this.state.date_to.split('T')[0]
        , timezone: this.state.timezone
        , filter: this.get_filter_string(false)
        , page: this.state.page
        , section: this.state.section
        , row: this.state.row
        , nocache: this.state.nocache
        , tabSorter: this.state.tabSorter
        , sectionSorter: this.state.sectionSorter
        , rowSorter: this.state.rowSorter
      }
        this.props.set_params(params)
        this.props.fetch_data(params.timezone, params.date_from, params.date_to, params.filter, params.page, params.section, params.row, params.nocache)

      } }>
        GO
      </Submit>
      </FormSectionButtons>
    </FormContainer>
  }
}