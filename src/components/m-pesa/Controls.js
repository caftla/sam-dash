// @flow

import React from 'react'
import R from 'ramda'
import { Submit, DateField, NumberField, FormTitle, FormRow, FormLabel, FormContainer, FormSection, FormSectionButtons, FilterFormSection } from '../Styled'
import { Input, LabelledInput, InputSelect, MySimpleSelect, ThemedDateRangePicker, MultiSelect } from '../common-controls/FormElementsUtils'
import { match, fetchState } from '../../adts'
const { format } = require('d3-format')
import moment from 'moment'
import List from '../_sidebar-controls/List.tsx'
import FilterItem from '../_sidebar-controls/FilterItem.tsx'
import BreakdownItem from '../_sidebar-controls/BreakdownItem.tsx'
import fieldsData from "./Controls.fields.json";
import "./Controls.styl"

const fields = R.pipe(R.map(c => ({
  label: c,
  value: c
})),
R.sortBy(x => x.value)
)(fieldsData);

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

  map(f) {
    return new UVal(f(this.value), this.original);
  }
}


export default class ControlComponent extends React.Component {
  constructor(props) {
    super(props)

    const breakdownU = new UVal(props.breakdown || 'day')
    const filterU = new UVal(props.filter || '-')
    const filterItems = PT.continueEither(console.warn)(x => x)(P.runFilterParserToColNamesAndExpr(filterU.value)) // [{name,expr}]
    const countries = R.pipe(
        R.find(x => x.name == "country")
      , x => !x ? [] : PT.continueEither(console.warn)(R.map(x => ({label: x.toUpperCase(), value: x.toLowerCase()})))(P.runFilterLangParserForCountries(x.expr))
    )(filterItems)
    
    this.state = {
      filterU ,
      breakdownU,
      date_fromU: new UVal(props.date_from || moment().add('day', -7).toJSON().split('T')[0] ),
      date_toU: new UVal(props.date_to || moment().add('day', +1).toJSON().split('T')[0] ),
      timezoneU: new UVal(props.timezone || new Date().getTimezoneOffset()  / -60),


      breakdownItems: PT.continueEither(console.warn)(x => x.map(c => ({label: c, value: c})))(P.runBreakdownParserToColNames(breakdownU.value)), // [{label, value}]

      filterItems: R.reject(({name}) => R.contains(name, ['country']))(filterItems) , // [{name,expr}]

      countries,

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
    
    const breakdownU = new UVal(props.breakdown).merge(state.breakdownU)
    // const breakdownColNamesU = breakdownU.map(v => PT.continueEither(console.warn)(x => x)(P.runBreakdownParserToColNames(v)))
    return {
      filterU: new UVal(props.filter).merge(state.filterU),
      breakdownU,
      timezoneU: new UVal(props.timezone).merge(state.timezoneU),
      date_fromU: new UVal(props.date_from).merge(state.date_fromU),
      date_toU: new UVal(props.date_to).merge(state.date_toU),

      breakdownItems: state.breakdownItems,
      filterItems: state.filterItems,
      countries: state.countries
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

    console.log('....', this.state)

    const { Submit, FormTitle, FormRow, FormLabel, FormContainer, FormSection, FormSectionButtons, FilterFormSection } = require('../Styled')
    const { InputSelect, MySimpleSelect, ThemedDateRangePicker0 } = require('../common-controls/FormElementsUtils')
    const { format } = require('d3-format')

    const countries = R.map(c => ({
      label: c.country_code,
      value: c.country_code.toLowerCase()
    }))(this.props.all_countries || []);

    const affiliates = R.map(a => ({
      value: (a.affiliate_ids || []).join("; "),
      label: a.affiliate_name || ""
    }))(this.props.all_affiliates || []);
    
    return <div id="sidebar" className="visible v2">
      <div id="filters"> 
        <FormContainer className={this.props.className}>
          <FormSection className="date-filter">
            <FormTitle>Date Range</FormTitle>
            <FormRow className='date_picker'>
              <ThemedDateRangePicker0
                date_from={this.state.date_fromU.value}
                date_to={this.state.date_toU.value}
                onChange={({ date_from, date_to }) => this.setState({
                  date_fromU: new UVal(date_from, false),
                  date_toU: new UVal(date_to, false)
                })} />
            </FormRow>
            <InputSelect className='timezone' name="Timezone" 
              onChange={ value => this.setState({ timezoneU: new UVal(value, false) }) }
              value={ this.state.timezoneU.value } options={ 
                R.pipe(
                    R.map(x => (12 - x / 2) )
                  , R.sortBy(x => x)
                  , R.map(x => ({value: format("+.1f")(x), name: `UTC${format("+.1f")(x)}`}))
                )(R.range(0, 48)) 
              } />
          </FormSection>
        </FormContainer>
        <FormSection><br/></FormSection>
        <FormSection>
          <FormTitle>Filters</FormTitle>
          <div className="field-section">
            <MultiSelect
              placeholder="Countries"
              values={this.state.countries || [] }
              options={countries}
              onValuesChange={countries => {
                this.setState({countries})
              }}
              createFromSearch={(options, value, search) =>  
                search.length == 2
                ? ({label: search.trim().toUpperCase(), value: search.trim().toLowerCase()})
                : null
                }
            /></div>
          {/* <div className="field-section">
            <MultiSelect
              placeholder="Affiliates"
              options={affiliates}
            />
          </div> */}

          <FiltersList items={
            this.state.filterItems.map(x => ({filterKey: {label: x.name, value: x.name}, value: x.expr}))
          }
            onChange={items => 
              this.setState({filterItems: items.map(i => ({name: !i.filterKey ? ''  : i.filterKey.value, expr: i.value}))})}
          />
          <textarea 
            style={{  
              width: '98%',
              height: '4ex',
              fontSize: '100%',
              fontFamily: 'Osaka, CONSOLAS, monospace, sans-serif',
              display: 'none'
            }}
            onChange={ev => this.setState({filterU: new UVal(ev.target.value, false)}) }
            value={this.state.filterU.value}
          />
          {
            !!this.state.errors.filter ? JSON.stringify(this.state.errors.filter) : ''
          }
        </FormSection>
        <FormSection>
          <FormTitle>Breakdown</FormTitle>
          <BreakdownList 
            onChange={breakdownItems => 
              breakdownItems.length == 0
              ? this.setState({breakdownItems: [{label:'',value: ''}]})
              : this.setState({breakdownItems})
            } 
            items={this.state.breakdownItems} />
          <textarea
            style={{  
              width: '98%',
              height: '4ex',
              fontSize: '100%',
              fontFamily: 'Osaka, CONSOLAS, monospace, sans-serif',
              display: 'none'
            }}
            onChange={ev => this.setState({ breakdownU: new UVal(ev.target.value, false) })}
            value={this.state.breakdownU.value}
          />
          {
            !!this.state.errors.breakdown ? JSON.stringify(this.state.errors.breakdown) : ''
          }
        </FormSection>
        <FormSection>
          <Submit
          onClick={() => 
            this.setState({
              breakdownU : new UVal(this.state.breakdownItems.map(i => i.value).join(','), false),
              filterU: new UVal(this.state.filterItems.concat(
                this.state.countries.length > 0 
                ? [{name: 'country', expr: `(${this.state.countries.map(c => c.value).join(',')})`}]
                : []
              ).map(i => `${i.name}:${i.expr}`).join(','), false)
            }, () => this.go(false))
          }
        >GO!</Submit>
        <Submit style={{width: '130px'}}
          onClick={() => this.go(true)}
        >GO (No Cache)</Submit>
        </FormSection>
      </div>
    </div>

  }
}

class BreakdownList extends React.PureComponent {
  // state = {
  //   items: this.props.items || [{
  //     label: '-', value: null
  //   }]
  // }

  render() {
    return (
      <List
        className='breakdown-list'
        mkDefaultItem={() => ({
          label: "",
          value: ""
        })}
        mkListItem={(item, onChange) => (
          <BreakdownItem options={fields} value={item} onChange={onChange} />
        )}
        onChange={items => {
          console.log("items", items);
          this.props.onChange(items)
        }}
        items={this.props.items}
      />
    );
  }
}

class FiltersList extends React.PureComponent {
  // state = {
  //   items: this.props.items || [
  //     {
  //       filterKey: null, // {label, value}
  //       value: ""
  //     }
  //   ]
  // };
  render() {
    return (
      <List className="filters-list"
        mkDefaultItem={() => ({
          filterKey: null,
          value: ""
        })}
        mkListItem={({ filterKey, value }, onChange) => (
          <FilterItem options={fields} filterKey={filterKey} value={value} onChange={onChange} />
        )}
        onChange={items => {
          console.log("items", items);
          this.props.onChange(items)
        }}
        items={this.props.items}
      />
    );
  }
}