// @flow

import React from 'react'
import styled from 'styled-components'

export const Body = styled.div`
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
  margin: 0;
  padding: 0;
  color: #636363;
  font-family: Osaka, CONSOLAS, monospace, sans-serif;
  margin: 0;
  padding: 0;
`

export const Title = styled.h1`
  font-weight: 100;
  margin: 2em 2em 1em 2em;
`

export const FormTitle = styled.h1`
  font-weight: 100;
  font-size: ${props => props.theme.formTitleFontSize || '2em'};
  margin-bottom: 2ex;
  width: 100%;
`

export const FormContainer = styled.div`
  max-width: ${props => props.theme.flexDirection == 'row' ? '100%' : '800px'};
  margin: ${props => props.theme.formContainerMargin || '10vh auto'};
  display: flex;
  flex-direction: ${props => props.theme.flexDirection || 'column'};
  align-items: ${props => props.theme.flexAlignItems || 'flex-end'};
`

export const DateField = styled.input`
  display: block;
  height: ${props => props.theme.elementHeight || '42px'};
  width: ${props => props.theme.elementWidth || '300px'};
  margin: 1ex 20px;
  padding: 0 12px;
  border-radius: 3px;
  border: 1px solid lightgrey;
  outline: none;
  font-size: ${props => props.theme.fontSize || '1.5em'};
`

export const Select = styled.select`
  display: block;
  height: ${props => props.theme.elementHeight || '42px'};
  width: ${props => props.theme.elementWidth || '300px'};
  margin: 1ex 20px;
  padding: 0 12px;
  border-radius: 3px;
  border: 1px solid lightgrey;
  font-size: ${props => props.theme.fontSize || '1.5em'};
`

export const Submit = styled.button`
  border-radius: 6px;
  font-size: ${props => props.theme.fontSize || '1.5em'};
  cursor: pointer;
  padding: 1ex;
  margin: 2ex 20px;
  align-self: ${props => props.theme.submitAlignSelf || ''}
`

export const FormSection = styled.div`
  width: ${props => props.theme.formSectionWidth || '100%'};
`

export const FilterFormSection = styled(FormSection)`
  width: ${props => props.theme.filterFormSectionWidth || '100%'};
  min-width: ${props => props.theme.filterFormSectionWidth || 'initial'};
  display: ${props => props.theme.filterFormSectionDisplay || 'block'};
  flex-wrap: wrap;
`


export const FormRow = styled.div`
  display: flex;
  align-items: baseline;
  justify-content: flex-end;
`
export const FormLabel = styled.label`
  font-size: ${props => props.theme.fontSize || '1.5em'};
  width: ${props => props.theme.formLabelWidth || 'auto'};
  min-width: ${props => props.theme.formLabelWidth || 'initial'};
  max-width: ${props => props.theme.formLabelWidth || 'initial'};
  text-align: ${props => props.theme.formLabelTextAlign || 'inherit'};
`
export const DashboardLoading = styled.div`
  font-size: 3em;
  margin: 30vh auto;
  width: 100%;
  text-align: center;
`
