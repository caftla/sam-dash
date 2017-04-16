import React from 'react'
import R from 'ramda'

const td_th_style = { textAlign: 'left' }
const th_style = R.merge(td_th_style, {
  fontWeight: 'bold', backgroundColor: '#f0f0f0', fontSize: '0.9em', padding: '0.5em 0'
})
const td_style = R.merge(td_th_style, {
  borderBottom: 'solid 1px #ddd', overflow: 'hidden', padding: '0.3em 0 0.3em 0'
})

export const TD = ({value, width, style}: any) => <td style={ { width: `${width}px`, ...td_style, ...(style || {}) } }>{value}</td>
export const TH = ({value, width, style, onClick = (() => {})}: any) =>
  <th onClick={ onClick } style={ { width: `${width}px`, ...th_style, ...(style || {}) } }>{value}</th>
export const TABLE = (props: any) =>
  <table style={ { width: `${props.width}px`, backgroundColor: 'white', marginBottom: '2em', color: 'black', fontFamily: 'Osaka, CONSOLAS, monospace', ...(props.style || {}) } } cellSpacing="0" cellPadding="0">
    { props.children }
  </table>
