import React from 'react'
import R from 'ramda'
import type { QueryParams } from 'my-types'
import { Submit, DateField, NumberField, FormTitle, FormRow, FormLabel, FormContainer, FormSection, FormSectionButtons, FilterFormSection, Select } from '../Styled'

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

export const InputSelect = ({name, value, options, onChange, disable}) =>
  <FormRow>
    <FormLabel>{name}</FormLabel>
    <Select value={ value } onChange={ e => onChange(e.target.value) } disabled={disable === false ? 'disabled' : ''}>
      <option value="-">Select</option>
      { options.map((c, i) => <option key={ i } value={ !!c && c.hasOwnProperty('value') ? c.value : c }>{ !!c && c.hasOwnProperty('name') ? c.name : c }</option>) }
    </Select>
  </FormRow>