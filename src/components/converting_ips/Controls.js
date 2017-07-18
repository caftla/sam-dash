// @flow

import React from 'react'
import R from 'ramda'
import type { QueryParams } from 'my-types'
import { Submit, DateField, FormTitle, FormRow, FormLabel, FormContainer, FormSection, FilterFormSection, Select } from '../Styled'
import styled from 'styled-components'
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
  , className: string
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

  constructor(props: ControlsProps) {
    super(props)
    const { params, filter_params, affiliate_name } = props
    
    this.state = {
        date_from: params.date_from.substr(0, 10)
      , date_to: params.date_to.substr(0, 10)
      , page: params.page
      , section: params.section
      , row: params.row
      , ...filter_params
      , affiliate_name
    }
  }

  componentDidMount() {
    this.props.try_fetch_traffic_breakdown(this.state)
  }

  render() {
    const {countries, affiliates, get_publishers} = this.props

    const get_all_props = this.props.get_all_props(this.state)
    const get_country_prop = this.props.get_country_prop(this.state)

    const { publishers, sub_ids } = get_publishers(this.state)

    const on_change_with_fetch_traffic_breakdown = (setter) => (value) => {
      setter(value)
      setTimeout(() => this.props.try_fetch_traffic_breakdown(this.state), 250)
    }

    const breakdown_list = [ 'affiliate_name', 'publisher_id', 'sub_id', 'country_code', 'operator_code', 'handle_name', 'product_type', 'device_class', 'gateway', 'day']

    return <FormContainer className={ this.props.className }>
      <FormSection>
        <FormTitle>Date Range</FormTitle>
        <Input type="date" name="From" value={ this.state.date_from } onChange={ val => this.setState({ 'date_from': val }) } />
        <Input type="date" name="To" value={ this.state.date_to } onChange={ val => this.setState({ 'date_to': val }) } />
      </FormSection>
      <FilterFormSection>
        <FormTitle>Filter</FormTitle>
        <InputSelect name="Country" onChange={ on_change_with_fetch_traffic_breakdown(country_code => this.setState({ country_code: country_code, operator_code: '' })) }
          value={ this.state.country_code } options={ this.props.countries.map(x => x.country_code) } />
        <InputSelect name="Operator" onChange={ operator_code => this.setState({ operator_code }) }
          value={ this.state.operator_code } options={ !this.state.country_code ? [] : get_country_prop('operator_codes') } />
        <InputSelect name="Affiliate" onChange={ on_change_with_fetch_traffic_breakdown(affiliate_name => this.setState({ affiliate_name })) }
          value={ this.state.affiliate_name } options={ !this.state.country_code ? get_all_props('affiliate_names') : get_country_prop('affiliate_names') } />
        <InputSelect name="Publisher" onChange={ publisher_id => this.setState({ publisher_id }) }
          value={ maybe.maybe('', x => x, this.state.publisher_id) } options={ publishers.map(x => x.publisher_id) } />
        <InputSelect name="Sub Id" onChange={ sub_id => this.setState({ sub_id }) }
          value={ maybe.maybe('', x => x, this.state.sub_id) } options={ sub_ids.map(x => x.sub_id) } />
        <InputSelect name="Handle" onChange={ handle_name => this.setState({ handle_name }) }
          value={ this.state.handle_name } options={ !this.state.country_code ? get_all_props('handle_names') : get_country_prop('handle_names') } />
        <InputSelect name="Gateway" onChange={ gateway => this.setState({ gateway }) }
          value={ this.state.gateway } options={ !this.state.country_code ? get_all_props('gateways') : get_country_prop('gateways') } />
        <InputSelect name="Platform" onChange={ platform => this.setState({ platform }) }
          value={ this.state.platform } options={ !this.state.country_code ? get_all_props('platforms') : get_country_prop('platforms') } />
      </FilterFormSection>
      <Submit onClick={ _ => {
        this.props.set_params({
            date_from: this.state.date_from
          , date_to: this.state.date_to
          , filter: this.props.get_filter_string(this.state, true)
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

import { connect } from 'react-redux'
import {
    set_params
  , cleanup_fetch_converting_ips
  , fetch_traffic_breakdown
} from '../../actions'

import hoc from '../controls-hoc'
const {ControlWithPublishers, ControlWithFilterParams, ControlsInstance} = hoc

const ConnectedControls = Controls => props =>
  <Controls { ...props } set_params={ params => {
      props.set_params(params)
      props.cleanup_fetch_converting_ips()
      props.history.push(`/converting_ips/${params.date_from}/${params.date_to}/${params.filter}`)
    }
  } />

export default connect(
    state => ({
        traffic_breakdown: state.traffic_breakdown
    })
  , { fetch_traffic_breakdown, cleanup_fetch_converting_ips, set_params }
)(R.compose(ControlWithPublishers, ControlWithFilterParams, ControlsInstance, ConnectedControls)(Controls))

