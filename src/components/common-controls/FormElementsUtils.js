import React from 'react'
import R from 'ramda'
import type { QueryParams } from 'my-types'
import { Submit, DateField, NumberField, FormTitle, FormRow, FormLabel, FormContainer, FormSection, FormSectionButtons, FilterFormSection, Select } from '../Styled'
import {ReactSelectize, SimpleSelect, MultiSelect} from 'react-selectize';
import 'react-selectize/themes/index.css'
import DateRangePicker from 'react-bootstrap-daterangepicker'
import moment from 'moment'

export const Input = ({type, name, value, onChange, style, hasLabel} : {type: string, name: string, value: string, onChange: string => void}) =>
  <FormRow hasLabel={ hasLabel }>
    <FormLabel>{name}</FormLabel>
    <DateField value={value} type={type} onChange={ x => onChange(x.target.value) } style={ style || {} } />
  </FormRow>

export const LabelledInput = ({name, children, hasLabel} : {name: string, children?: Array<any>}) =>
  <FormRow hasLabel={ hasLabel }>
    <FormLabel>{name}</FormLabel>
    { children }
  </FormRow>

export const InputSelect = ({name, value, options, onChange, disable, showLabel, className}) => {
  const options1 = options // [{name: 'Select', value:'-'}].concat(options)
  const defaultOption = !value ? null: options.find(o => !!o && (o.value == value || o == value))
  const defaultLabel =  ((!!defaultOption ? (defaultOption.name || defaultOption) : value) || '-').toString()
  const defaultValue = ((!!defaultOption ? (defaultOption.value || defaultOption) : value) || '-').toString()
  return <FormRow hasLabel={ showLabel } className={ className || '' }>
    {
      showLabel ? <FormLabel>{name}</FormLabel> : ''
    }
    <SimpleSelect placeholder={ name } 
      value={ !!defaultOption ? { label: defaultLabel, value: defaultValue } : null  } tether={ true } onValueChange={ e => onChange(!e ? '' : e.value)  } 
      disabled={!!disable}
      >
      {   options1
          .map((c, i) => {
            const value = ((!!c && c.hasOwnProperty('value') ? c.value : c) || '').toString()
            const label = ((!!c && c.hasOwnProperty('name') ? c.name : c) || '').toString()
            return <option key={ i } value={ value } label={ label }>{ label }</option>
          })
      }
    </SimpleSelect>
  </FormRow>
}

export const MySimpleSelect = ({name, value, options, onChange, disable, className}) => {
  const options1 = options // [{name: 'Select', value:'-'}].concat(options)
  const defaultOption = !value ? null: options.find(o => !!o && (o.value == value || o == value))
  const defaultLabel =  ((!!defaultOption ? (defaultOption.name || defaultOption) : value) || '-').toString()
  const defaultValue = ((!!defaultOption ? (defaultOption.value || defaultOption) : value) || '-').toString()
  return <SimpleSelect placeholder={ name } 
    className={ className }
    value={ !!defaultOption ? { label: defaultLabel, value: defaultValue } : null  } 
    tether={ true } 
    onValueChange={ e => onChange(!e ? '' : e.value)  } 
    disabled={!!disable}
    >
    {   options1
        .map((c, i) => {
          const value = ((!!c && c.hasOwnProperty('value') ? c.value : c) || '').toString()
          const label = ((!!c && c.hasOwnProperty('name') ? c.name : c) || '').toString()
          return <option key={ i } value={ value } label={ label }>{ label }</option>
        })
    }
  </SimpleSelect>
}

export const InputMultiSelect = ({name, value, options, onChange, disable, hasLabel}) => {
  const options1 = options // [{name: 'Select', value:'-'}].concat(options)

  const optionToValueLabel = c => {
    const value = ((!!c && c.hasOwnProperty('value') ? c.value : c) || '').toString()
    const label = ((!!c && c.hasOwnProperty('name') ? c.name : c) || '').toString()
    return { value, label }
  }

  return <FormRow hasLabel={ hasLabel }>
    {
      // hideLabel ? '' : <FormLabel>{name}</FormLabel>
    }
    <MultiSelect placeholder={ name } 
      values={ !value ? [] : value.split(';').map(v => options.find(o => !!o ? o.value == v || o == v : false)).filter(x => !!x).map(optionToValueLabel) } 
      tether={ true } 
      onValuesChange={ es => { return es.length == 0 ? onChange('') : onChange(es.map(e => e.value).join(';')) }  } 
      disabled={disable === false ? 'disabled' : ''}
      >
      {   options1
          .map((c, i) => {
            const value = ((!!c && c.hasOwnProperty('value') ? c.value : c) || '').toString()
            const label = ((!!c && c.hasOwnProperty('name') ? c.name : c) || '').toString()
            return <option key={ i } value={ value } label={ label }>{ label }</option>
          })
      }
    </MultiSelect>
  </FormRow>
}

const add_time = date => date.indexOf('T') > -1
  ? date
  : date + 'T00:00:00'
  
export const ThemedDateRangePicker = ({self}) =>
  <DateRangePicker
    startDate={moment(self.state.date_from)}
    endDate={moment(self.state.date_to)}
    locale={{
      "format": "DD-MM-YYYY",
      "separator": " - ",
    }}
    ranges={{
      'Today': [moment(), moment().add(1, 'days')],
      'Yesterday and Today': [moment().subtract(1, 'days'), moment().add(1, 'days')],
      'Yesterday Only': [moment().subtract(1, 'days'), moment().add(0, 'days')],
      'Last 7 Days and Today': [moment().subtract(7, 'days'), moment().add(1, 'days')],
      'Last 7 Days Only': [moment().subtract(7, 'days'), moment().add(0, 'days')],
      'Last Week': [moment().subtract(7, 'days').startOf('week').add(1, 'days'), moment().startOf('week').add(1, 'days')],
      'Last 5 Weeks': [moment().subtract(5 * 7, 'days').startOf('week').add(1, 'days'), moment().startOf('week').add(1, 'days')],
      'Last 13 Weeks': [moment().subtract(13 * 7, 'days').startOf('week').add(1, 'days'), moment().startOf('week').add(1, 'days')],
      'Last 5 Weeks and this Week': [moment().subtract(5 * 7, 'days').startOf('week').add(1, 'days'), moment().startOf('week').add(7, 'days').add(1, 'days')],
      'Last 30 Days': [moment().subtract(29, 'days'), moment().add(1, 'days')],
      'This Month': [moment().startOf('month'), moment().endOf('month').add(1, 'days')],
      'Last Month': [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month').add(1, 'days')]
    }}
    onEvent={(event, picker) =>
      self.setState({
        date_from: add_time(moment(picker.startDate).format('YYYY-MM-DD'))
        , date_to: add_time(moment(picker.endDate).format('YYYY-MM-DD'))
      })
    }>
    <div className='date-range-btn'>
      <i className='fa fa-calendar calendar-icon' aria-hidden='true' />
      {moment(self.state.date_from).format('DD-MM-YY')} - {moment(self.state.date_to).format('DD-MM-YY')}
      <i className='fa fa-caret-down caret-icon' aria-hidden='true' />
    </div>
  </DateRangePicker>