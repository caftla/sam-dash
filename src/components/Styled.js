// @flow

import React from 'react'
import styled from 'styled-components'

export const Body = styled.div`
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
  margin: 0;
  padding: 0;
`

export const Title = styled.h1`
  font-family: sans-serif;
  font-weight: 100;
  margin: 30px 30px 20px 30px;
`

export const FormTitle = styled.h1`
  font-family: sans-serif;
  font-weight: 100;
  margin-bottom: 2ex;
`

export const FormContainer = styled.div`
  max-width: 800px;
  margin: 10vh auto;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}
`

export const DateField = styled.input`
  display: block;
  height: 42px;
  width: 300px;
  margin: 1ex 20px;
  padding: 0 12px;
  border-radius: 3px;
  border: 1px solid lightgrey;
  outline: none;
  font-size: 1.5em;
`

export const Select = styled.select`
  display: block;
  height: 42px;
  width: 300px;
  margin: 1ex 20px;
  padding: 0 12px;
  border-radius: 3px;
  border: 1px solid lightgrey;
  font-size: 1.5em;
`

export const Submit = styled.button`
  border-radius: 6px;
  font-size: 1.5em;
  cursor: pointer;
  padding: 1ex;
  margin: 2ex 20px;
`

export const FormSection = styled.div`
  width: 100%;
`

export const FormRow = styled.div`
  display: flex;
  align-items: baseline;
  justify-content: flex-end;
`
export const FormLabel = styled.label`
  font-size: 1.5em;
`
export const DashboardLoading = styled.div`
  font-size: 3em;
  margin: 30vh auto;
  width: 100%;
  text-align: center;
`
