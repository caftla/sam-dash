import React from 'react'
import R from 'ramda'
import type { QueryParams } from 'my-types'
import { Submit, DateField, NumberField, FormTitle, FormRow, FormLabel, FormContainer, FormSection, FormSectionButtons, FilterFormSection, Select } from '../Styled'
import {ReactSelectize, SimpleSelect, MultiSelect} from 'react-selectize';
import 'react-selectize/themes/index.css'

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

