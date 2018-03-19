// @flow

import React from 'react'
import R from 'ramda'
import type { QueryParams } from 'my-types'
import { Submit, FormTitle, FormRow, FormLabel, FormContainer, FormSection, FormSectionButtons, FilterFormSection } from '../Styled'
import styled from 'styled-components'
import stylus from './Controls.styl'
import { InputSelect, MySimpleSelect, ThemedDateRangePicker } from '../common-controls/FormElementsUtils'


const { format } = require('d3-format')


type ControlsProps = {
  affiliates: Array<any>
  , set_params: QueryParams => any
  , filter_params: QueryParams
  , className?: string
}

type ControlsState = {
    date_from: string
  , date_to: string
  , timezone: number
  , affiliate_name: string
  , msisdn: string
}

const add_time = date => date.indexOf('T') > -1
  ? date
  : date + 'T00:00:00'

class Controls extends React.Component {
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
    const { params, filter_params } = props

    this.state = {
        date_from: params.date_from
      , date_to: params.date_to
      , from_hour: '0'
      , to_hour: '24'
      , timezone: params.timezone
      , msisdn: ''
      , affiliate_name: ''
      , ...filter_params
      , noMsisdnProvided: false
      , countryCodeNotSelected: false
      , nocache: !!params.nocached
      , cache_buster_id: `cb_${Math.round(Math.random() * 100000)}`
    }
  }

  get_filter_string_by_fields(ofields) {
    const fields = ((this.state['from_hour'] == 0 || !this.state['from_hour']) && (this.state['to_hour'] == 24 || !this.state['to_hour']))
      ? ofields = R.reject(x => x == 'from_hour' || x == 'to_hour')(ofields)
      : ofields

    return R.pipe(
        R.map(k => [k, this.state[k]])
      , R.reject(([key, value]) => !value || value == '-')
      , R.map(R.join('='))
      , R.join(',')
      , x => !x ? '-' : x
      , y => y.replace(/\//g, '%2F')
    )(fields)
	}

  get_filter_string() {
    return this.get_filter_string_by_fields(["affiliate_name", "from_hour", "to_hour", "msisdn"])
  }

  render() {
    return <FormContainer className={ this.props.className }>      
      <FormSection className="date-filter">
        <FormTitle>Date Range</FormTitle>
        <FormRow className='date_picker'>
          <ThemedDateRangePicker self={this} />
        </FormRow>
        <InputSelect className='timezone' name="Timezone" onChange={ timezone => this.setState({ timezone: timezone }) }
          value={ this.state.timezone } options={ 
            R.pipe(
                R.map(x => (12 - x / 2) )
              , R.sortBy(x => x)
              , R.map(x => ({value: x, name: `UTC${format("+.1f")(x)}`}))
            )(R.range(0, 48)) 
          } />
        <FormRow className='hour_filter'>
          <FormLabel>Hour</FormLabel>
          <MySimpleSelect className='from_hour' name="From"
            onChange={from_hour => this.setState({ from_hour: from_hour })}
            value={this.state.from_hour} options={
              R.pipe(
                R.map(x => ({ value: x.toString(), name: (x < 10 ? `0${x}` : `${x}`) }))
              )(R.range(0, 25))
            } />
          <MySimpleSelect className='to_hour' name="To"
            onChange={to_hour => this.setState({ to_hour: to_hour })}
            value={this.state.to_hour} options={
              R.pipe(
                R.map(x => ({ value: x.toString(), name: (x < 10 ? `0${x}` : `${x}`) }))
              )(R.range(0, 25))
            } />
        </FormRow>
      </FormSection>
      <FilterFormSection>
        <FormTitle>Affiliate Information:</FormTitle>
        <MySimpleSelect name="Affiliate" onChange={ affiliate_name => this.setState({ 
              affiliate_name: affiliate_name }) }
          value={ this.state.affiliate_name } options={ this.props.affiliates.map(x => x.affiliate_name) } required />
          <p style={ {display: this.state.countryCodeNotSelected ? 'block' : 'none', color: 'red', fontSize: '12px' }}> Please select affiliate to proceed!</p>
      </FilterFormSection>
      <FormSectionButtons>
      <div>
        <label htmlFor={ this.state.cache_buster_id }>No cache</label><input 
          checked={ this.state.nocache } 
          onChange={ e => this.setState({ nocache: !!e.target.checked }) }
          id={ this.state.cache_buster_id } type="checkbox" />
      </div>
        <Submit onClick={_ => {
          if (this.state.affiliate_name == '') {
            this.setState({ countryCodeNotSelected: true })
          }
          else {
            this.props.set_params({
              date_from: this.state.date_from
              , date_to: this.state.date_to
              , from_hour: this.state.from_hour
              , to_hour: this.state.to_hour
              , timezone: this.state.timezone
              , msisdn: this.state.msisdn
              , affiliate_name: this.state.affiliate_name
              , filter: this.get_filter_string(this.state, true)
              , nocache: this.state.nocache
            })
            this.setState({ noMsisdnProvided: false })
            this.setState({ countryCodeNotSelected: false })
          }
        }
        }
        >
          GO
        </Submit>
      </FormSectionButtons>
    </FormContainer>
  }
}

import {
  set_params
, cleanup_fetch_co_invoices
} from '../../actions'
import { connect } from 'react-redux'
import hoc from '../controls-hoc'

const {ControlWithFilterParams, ControlsInstance } = hoc

const ConnectedControls = Controls => props =>
  <Controls { ...props } set_params={ params => {
    props.set_params(params)
    const formatTimezone = format("+.1f")
    props.cleanup_fetch_co_invoices()
    const make_url = params =>
      params.nocache
      ? `/co_invoices/${formatTimezone(params.timezone)}/${params.date_from}/${params.date_to}/${params.filter}?nocache=true`
      : `/co_invoices/${formatTimezone(params.timezone)}/${params.date_from}/${params.date_to}/${params.filter}`
    // props.history.push(`/co_invoices/${params.timezone}/${params.date_from}/${params.date_to}/${params.filter}/-/-/-/`)
    props.history.push(make_url(params))
}
} />

export default connect(
  state => ({
      // traffic_breakdown: state.traffic_breakdown
  })
, { cleanup_fetch_co_invoices, set_params }
)(R.compose(ControlWithFilterParams, ControlsInstance, ConnectedControls)(Controls))
