// @flow

import React from 'react'
import R from 'ramda'
import type { QueryParams } from 'my-types'
import { Submit, DateField, FormTitle, FormRow, FormLabel, FormContainer, FormSection, FilterFormSection, Select } from '../Styled'
import styled from 'styled-components'
import * as maybe from 'flow-static-land/lib/Maybe'
import type { Maybe } from 'flow-static-land/lib/Maybe'
import { connect } from 'react-redux'
import {
    fetch_traffic_breakdown
} from '../../actions'

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

type TrafficBreakDownItem = {
    country_code: string
  , operator_code: string
  , affiliate_id: string
  , publisher_id: string
  , sub_id: string
  , views: number
  , sales: number
  , firstbillings: number
}

type ControlsProps = {
    params: QueryParams
  , countries: Array<any>
  , affiliates: Array<any>
  , traffic_breakdown: Maybe<Array<TrafficBreakDownItem>>
  , fetch_traffic_breakdown: (date_from : string, date_to : string, filter : string) => void
  , set_params: QueryParams => any
}

type ControlsState = {
    date_from: string
  , date_to: string
  , page: string
  , section: string
  , row: string
  , country_code: string
  , operator_code: string
  , affiliate_name: string
  , handle_name: string
  , gateway: string
  , platform: string
  , publisher_id: Maybe<string>
  , sub_id: Maybe<string>
}

class Controls extends React.Component {
  props: ControlsProps
  state: ControlsState
  get_filter_string(with_publisher_id: boolean) {
    const affiliate_ids = R.pipe(
        R.filter(x => x.affiliate_name == this.state.affiliate_name)
      , R.map(x => x.affiliate_ids)
      , R.chain(x => x)
      , R.join(';')
    )(this.props.affiliates)
    return R.pipe(
        R.map(k => [k, this.state[k]])
      , R.filter(([k, v]) => !!v)
      , R.map(R.join('='))
      , R.join(',')
      , x => !x ? '-' : x
    )(["country_code", "operator_code", "handle_name", "gateway", "platform"].concat(with_publisher_id ? ["publisher_id", "sub_id"] : [])) + (!affiliate_ids ? '' : `,affiliate_id=${affiliate_ids}`)
  }

  try_fetch_traffic_breakdown() {
    if(!!this.state.country_code && !!this.state.affiliate_name && !!this.state.date_from && !!this.state.date_to) {
      this.props.fetch_traffic_breakdown(this.state.date_from, this.state.date_to, this.get_filter_string(false))
    }
  }

  constructor(props: ControlsProps) {
    super(props)
    const { params } = props
    const filter_params = R.pipe(
        R.split(',')
      , R.map(R.split('='))
      , R.fromPairs
    )(params.filter)

    const params_affiliate_ids = !filter_params.affiliate_id ? [] : R.split(';')(filter_params.affiliate_id)
    const affiliate_name = params_affiliate_ids.length == 0 ? '' : R.pipe(
        x => x[0]
      , affiliate_id => R.pipe(
          R.find(x => x.affiliate_ids.some(a => a == affiliate_id))
        , x => !x ? '' : x.affiliate_name
      )(props.affiliates)
    )(params_affiliate_ids)
    this.state = {
        date_from: params.date_from
      , date_to: params.date_to
      , page: params.page
      , section: params.section
      , row: params.row
      , ...filter_params
      , affiliate_name
    }
  }

  componentDidMount() {
    this.try_fetch_traffic_breakdown()
  }

  render() {
    const {countries, affiliates, traffic_breakdown} = this.props
    console.log('traffic_breakdown', traffic_breakdown)

    const get_all_props = prop => R.pipe(
        R.chain(R.prop(prop))
      , R.uniq
      , R.sortBy(x => x)
    )(countries)
    const get_country_prop = prop => R.pipe(
        R.find(x => x.country_code == this.state.country_code)
      , R.prop(prop)
    )(countries)

    const get_breakdown_stats = R.reduce(
        ({views, sales, firstbillings}, a) => ({views: views + a.views, sales: sales + a.sales, firstbillings: firstbillings + a.firstbillings})
      , {views: 0, sales: 0, firstbillings: 0}
    )

    const selected_affiliate_ids = !this.state.affiliate_name
      ? []
      : R.pipe(
          R.filter(x => x.affiliate_name == this.state.affiliate_name)
        , R.chain(x => x.affiliate_ids)
      )(affiliates)
    console.log('selected_affiliate_ids', this.state.affiliate_name, selected_affiliate_ids, this.state)
    const publishers = maybe.maybe(
        []
      , R.pipe(
          R.filter(x => x.country_code == this.state.country_code && selected_affiliate_ids.some(s => s === x.affiliate_id))
        , R.groupBy(x => x.publisher_id)
        , R.toPairs
        , R.map(([publisher_id, values]) => ({
            publisher_id
          , ...get_breakdown_stats(values)
          , sub_ids: R.pipe(
                R.groupBy(x => x.sub_id)
              , R.toPairs
              , R.map(([sub_id, values]) => ({
                    sub_id
                  , ...get_breakdown_stats(values)
                }))
              , R.sortBy(x => x.sales * -1)
            )(values)
          }))
        , R.sortBy(x => x.sales * -1)
      )
      , traffic_breakdown
    )

    const sub_ids = publishers.length == 0
      ? []
      : R.pipe(
          R.filter(x => x.publisher_id == this.state.publisher_id)
        , R.chain(x => x.sub_ids)
      )(publishers)

    const on_change_with_fetch_traffic_breakdown = (setter) => (value) => {
      setter(value)
      setTimeout(() => this.try_fetch_traffic_breakdown(), 250)
    }

    console.log('publishers', publishers)

    const breakdown_list = [ 'affiliate_name', 'publisher_id', 'sub_id', 'country_code', 'operator_code', 'handle_name', 'product_type', 'device_class', 'gateway', 'day']

    return <FormContainer>
      <FormSection>
        <FormTitle>Date Range:</FormTitle>
        <Input type="date" name="From" value={ this.state.date_from } onChange={ val => this.setState({ 'date_from': val }) } />
        <Input type="date" name="To" value={ this.state.date_to } onChange={ val => this.setState({ 'date_to': val }) } />
      </FormSection>
      <FilterFormSection style={ {width: '900px'} }>
        <FormTitle>Filter:</FormTitle>
        <InputSelect name="Country" onChange={ on_change_with_fetch_traffic_breakdown(country_code => this.setState({ country_code: country_code, operator_code: '' })) }
          value={ this.state.country_code } options={ this.props.countries.map(x => x.country_code) } />
        <InputSelect name="Operator" onChange={ operator_code => this.setState({ operator_code }) }
          value={ this.state.operator_code } options={ !this.state.country_code ? [] : get_country_prop('operator_codes') } />
        <InputSelect name="Affiliate" onChange={ on_change_with_fetch_traffic_breakdown(affiliate_name => this.setState({ affiliate_name })) }
          value={ this.state.affiliate_name } options={ !this.state.country_code ? get_all_props('affiliate_names') : get_country_prop('affiliate_names') } />
        <InputSelect name="Handle" onChange={ handle_name => this.setState({ handle_name }) }
          value={ this.state.handle_name } options={ !this.state.country_code ? get_all_props('handle_names') : get_country_prop('handle_names') } />
        <InputSelect name="Gateway" onChange={ gateway => this.setState({ gateway }) }
          value={ this.state.gateway } options={ !this.state.country_code ? get_all_props('gateways') : get_country_prop('gateways') } />
        <InputSelect name="Platform" onChange={ platform => this.setState({ platform }) }
          value={ this.state.platform } options={ !this.state.country_code ? get_all_props('platforms') : get_country_prop('platforms') } />
        <InputSelect name="Publisher" onChange={ publisher_id => this.setState({ publisher_id }) }
          value={ maybe.maybe('', x => x, this.state.publisher_id) } options={ publishers.map(x => x.publisher_id) } />
        <InputSelect name="Sub Id" onChange={ sub_id => this.setState({ sub_id }) }
          value={ maybe.maybe('', x => x, this.state.sub_id) } options={ sub_ids.map(x => x.sub_id) } />
      </FilterFormSection>
      <Submit onClick={ _ => {
        this.props.set_params({
            date_from: this.state.date_from
          , date_to: this.state.date_to
          , filter: this.get_filter_string(true)
          , page: this.state.page
          , section: this.state.section
          , row: this.state.row
        })
      } }>
        Go!
      </Submit>
    </FormContainer>
  }
}

export default connect(
    state => ({ traffic_breakdown: state.traffic_breakdown })
  , { fetch_traffic_breakdown }
)(Controls)
