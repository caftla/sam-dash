import React from 'react'
import R from 'ramda'
import type { QueryParams } from 'my-types'
import { Submit, DateField, NumberField, FormTitle, FormRow, FormLabel, FormContainer, FormSection, FormSectionButtons, FilterFormSection, Select } from '../Styled'
import {ReactSelectize, SimpleSelect, MultiSelect} from 'react-selectize';
import 'react-selectize/themes/index.css'

export const Input = ({type, name, value, onChange, style} : {type: string, name: string, value: string, onChange: string => void}) =>
  <FormRow>
    <FormLabel>{name}</FormLabel>
    <DateField value={value} type={type} onChange={ x => onChange(x.target.value) } style={ style || {} } />
  </FormRow>

export const LabelledInput = ({name, children} : {name: string, children?: Array<any>}) =>
  <FormRow>
    <FormLabel>{name}</FormLabel>
    { children }
  </FormRow>

export const InputSelect = ({name, value, options, onChange, disable}) => {
  const options1 = [{name: 'Select', value:'-'}].concat(options)
  const defaultOption = !value ? { name: 'Select', value: '-' } : options.find(o => !!o && (o.value == value || o == value))
  const defaultLabel =  ((!!defaultOption ? (defaultOption.name || defaultOption) : value) || '-').toString()
  const defaultValue = ((!!defaultOption ? (defaultOption.value || defaultOption) : value) || '-').toString()
  console.log('--', name, value, defaultOption, defaultValue)
  return <FormRow>
    <FormLabel>{name}</FormLabel>
    <SimpleSelect placeholder="" 
      value={ { label: defaultLabel, value: defaultValue } } tether={ true } onValueChange={ e => onChange(e.value)  } 
      disabled={disable === false ? 'disabled' : ''}
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