// @flow

import React from 'react'
import styled from 'styled-components'

export const Body = styled.div`
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
  margin: 0;
  padding: 0;
  color: #636363;
  font-family: 'Roboto Mono', monospace;;
  margin: 0;
  padding: 0;
`

  // font-weight: 100;
  // margin: 2em 2em 1em 2em;
export const Title = styled.h1`
`

  // font-weight: 100;
  // font-size: ${props => props.theme.formTitleFontSize || '2em'};
  // margin-bottom: 2ex;
  // width: 100%;
export const FormTitle = styled.h1`

`

// max-width: ${props => props.theme.flexDirection == 'row' ? '100%' : '800px'};
// margin: ${props => props.theme.formContainerMargin || '10vh auto'};
// display: flex;
// flex-direction: ${props => props.theme.flexDirection || 'column'};
// align-items: ${props => props.theme.flexAlignItems || 'flex-end'};
export const FormContainer = styled.div`
`

  // display: block;
  // height: ${props => props.theme.elementHeight || '42px'};
  // width: ${props => props.theme.elementWidth || '300px'};
  // margin: 1ex 20px;
  // padding: 0 12px;
  // border-radius: 3px;
  // border: 1px solid lightgrey;
  // outline: none;
  // font-size: ${props => props.theme.fontSize || '1.5em'};
export const DateField = styled.input`

`

  // width: 50px;
export const NumberField = styled(DateField)`
`


  // display: block;
  // height: ${props => props.theme.elementHeight || '42px'};
  // width: ${props => props.theme.elementWidth || '300px'};
  // margin: 1ex 20px;
  // padding: 0 12px;
  // border-radius: 3px;
  // border: 1px solid lightgrey;
  // font-size: ${props => props.theme.fontSize || '1.5em'};
export const Select = styled.select`
`

  // border-radius: 6px;
  // font-size: ${props => props.theme.fontSize || '1.5em'};
  // cursor: pointer;
  // padding: 1ex;
  // margin: 2ex 20px;
  // align-self: ${props => props.theme.submitAlignSelf || ''}
export const Submit = styled.button`
`

// width: ${props => props.theme.formSectionWidth || '100%'};
export const FormSection = styled.div`
`

// display: flex;
//   align-items: baseline;
//   justify-content: flex-end;
//   align-self: flex-end;
//   flex-direction: ${props => props.theme.formSectionButtonsFlexDirection || 'row'};
export const FormSectionButtons = styled(FormSection)`
`

  // width: ${props => props.theme.filterFormSectionWidth || '100%'};
  // min-width: ${props => props.theme.filterFormSectionWidth || 'initial'};
  // display: ${props => props.theme.filterFormSectionDisplay || 'block'};
  // flex-wrap: wrap;
export const FilterFormSection = styled(FormSection)`
`


// display: flex;
//   align-items: baseline;
//   justify-content: flex-end;
export const FormRow = ({hasLabel, className, children}) => <div className={ `form-row ${className} ${hasLabel ? 'has-label': ''}` }>{ children }</div>

  // font-size: ${props => props.theme.fontSize || '1.5em'};
  // width: ${props => props.theme.formLabelWidth || 'auto'};
  // min-width: ${props => props.theme.formLabelWidth || 'initial'};
  // max-width: ${props => props.theme.formLabelWidth || 'initial'};
  // text-align: ${props => props.theme.formLabelTextAlign || 'inherit'};
export const FormLabel = styled.label`
`
export const DashboardLoading = styled.div`
  font-size: 3em;
  margin: 30vh auto;
  width: 100%;
  text-align: center;
`
export const GoogleButton = ({className, href, text}) => (
  <a className={className} href={href}> 
    <svg aria-hidden="true" className="svg-icon" width="20" height="20" viewBox="0 0 18 18">
      <g>
        <path d="M16.51 8H8.98v3h4.3c-.18 1-.74 1.48-1.6 2.04v2.01h2.6a7.8 7.8 0 0 0 2.38-5.88c0-.57-.05-.66-.15-1.18z" fill="#4285F4"></path>
        <path d="M8.98 17c2.16 0 3.97-.72 5.3-1.94l-2.6-2a4.8 4.8 0 0 1-7.18-2.54H1.83v2.07A8 8 0 0 0 8.98 17z" fill="#34A853"></path>
        <path d="M4.5 10.52a4.8 4.8 0 0 1 0-3.04V5.41H1.83a8 8 0 0 0 0 7.18l2.67-2.07z" fill="#FBBC05"></path>
        <path d="M8.98 4.18c1.17 0 2.23.4 3.06 1.2l2.3-2.3A8 8 0 0 0 1.83 5.4L4.5 7.49a4.77 4.77 0 0 1 4.48-3.3z" fill="#EA4335"></path>
      </g>
    </svg> { text }
  </a>
)
