// @flow

import React from 'react'
import R from 'ramda'
import { Submit, DateField, NumberField, FormTitle, FormRow, FormLabel, FormContainer, FormSection, FormSectionButtons, FilterFormSection, Select } from '../Styled'
import { Input, LabelledInput, InputSelect, MySimpleSelect, ThemedDateRangePicker } from '../common-controls/FormElementsUtils'
import BreakdownItem from '../common-controls/BreakdownItem'
import { match, fetchState } from '../../adts'
const { format } = require('d3-format')
import moment from 'moment'

class UVal {
  constructor(value, original = true){
    this.value = value
    this.original = original;
  }

  manipulate(value) {
    return new UVal(value, false)
  }

  merge(right) {
    return UVal.merge(this, right)
  }

  static merge(left, right) {
    return  left.original ? right
          : right.original ? left
          : right
  }
}


export default class ControlComponent extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      filterU : new UVal(props.filter || '-'),
      breakdownU: new UVal(props.breakdown || 'day'),
      date_fromU: new UVal(props.date_from || moment().add('day', -7).toJSON().split('T')[0] ),
      date_toU: new UVal(props.date_to || moment().add('day', +1).toJSON().split('T')[0] ),
      timezoneU: new UVal(props.timezone || new Date().getTimezoneOffset()  / -60),
      errors: {}
    }
    setTimeout(() => 
      match({
          Nothing: () => this.go()
        , Loading: () => void 8
        , Error: (error) => void 8
        , Loaded: (data) => void 8
      })(props.fetchState)
    , 10)
  }
  static getDerivedStateFromProps(props, state) {
    console.log('getDerivedStateFromProps', props, state)
    return {
      filterU: new UVal(props.filter).merge(state.filterU),
      breakdownU: new UVal(props.breakdown).merge(state.breakdownU),
      timezoneU: new UVal(props.timezone).merge(state.timezoneU),
      date_fromU: new UVal(props.date_from).merge(state.date_fromU),
      date_toU: new UVal(props.date_to).merge(state.date_toU)
    }
  }
  go(noCache) {
    let errors = {}

    const breakdownStrE = PT.bimapEither(err => {
                              errors = {...errors, breakdown: err}
                            })
                            (PT.breakdownToQueryStringPath)
                            (P.runBreakdownParser(this.state.breakdownU.value))
    const filterStrE = PT.bimapEither(err => {
                              errors = {...errors, filter: err}
                            })
                            (PT.filtersToQueryStringPath)
                            (P.runFilterParser(this.state.filterU.value))

    this.setState({errors})
    
    PT.continueEither(x => { /* there is an error */ })
                     (([breakdown, filter]) => {
                      console.log('breakdown', breakdown)
                       this.props.onChange({
                        timezone: this.state.timezoneU.value,
                        date_from: this.state.date_fromU.value,
                        date_to: this.state.date_toU.value,
                        filter: filter,
                        breakdown: breakdown,
                        noCache: noCache
                      })})
                     (PT.sequenceEithers([breakdownStrE, filterStrE]))
  }
  render() {
    const { Submit, FormTitle, FormRow, FormLabel, FormContainer, FormSection, FormSectionButtons, FilterFormSection } = require('../Styled')
    const { InputSelect, MySimpleSelect, ThemedDateRangePicker0 } = require('../common-controls/FormElementsUtils')
    const { format } = require('d3-format')

    return <div id="sidebar" className="visible">
      <div id="filters"> 
        <FormContainer className={ this.props.className }>      
          <FormSection className="date-filter">
            <FormTitle>Date Range</FormTitle>
            <FormRow className='date_picker'>
              <ThemedDateRangePicker0 
                date_from={this.state.date_fromU.value} 
                date_to={this.state.date_toU.value} 
                onChange={({date_from, date_to}) => this.setState({ 
                  date_fromU: new UVal(date_from, false),
                  date_toU: new UVal(date_to, false) 
                }) } />
            </FormRow>
            <InputSelect className='timezone' name="Timezone" onChange={ timezone => this.setState({ timezoneU: new UVal(timezone, false) }) }
              value={ this.state.timezoneU.value } options={ 
                R.pipe(
                    R.map(x => (12 - x / 2) )
                  , R.sortBy(x => x)
                  , R.map(x => ({value: x, name: `UTC${format("+.1f")(x)}`}))
                )(R.range(0, 48)) 
              } />
          </FormSection>
        </FormContainer>
        <FormSection>
          <FormTitle>Filters</FormTitle>
          <textarea 
            style={{  
              width: '98%',
              height: '4ex',
              fontSize: '100%',
              fontFamily: 'Osaka, CONSOLAS, monospace, sans-serif'
            }}
            onChange={ev => this.setState({filterU: new UVal(ev.target.value, false)}) }
          >{this.state.filterU.value}</textarea>
          {
            !!this.state.errors.filter ? JSON.stringify(this.state.errors.filter) : ''
          }
        </FormSection>
        <FormSection>
          <FormTitle>Breakdown</FormTitle>
          <textarea
            style={{  
              width: '98%',
              height: '4ex',
              fontSize: '100%',
              fontFamily: 'Osaka, CONSOLAS, monospace, sans-serif'
            }}
            onChange={ev => this.setState({ breakdownU: new UVal(ev.target.value, false) })}
          >{this.state.breakdownU.value}</textarea>
          {
            !!this.state.errors.breakdown ? JSON.stringify(this.state.errors.breakdown) : ''
          }
        </FormSection>
        <FormSection>
          <Submit
          onClick={() => this.go(false)}
        >GO!</Submit>
        <Submit style={{width: '130px'}}
          onClick={() => this.go(true)}
        >GO (No Cache)</Submit>
        </FormSection>
      </div>
    </div>

  }
}
