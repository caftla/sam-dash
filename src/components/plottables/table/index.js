import React from 'react'
import R from 'ramda'
import './table.styl'

const td_th_style = { textAlign: 'left' }
const th_style = R.merge(td_th_style, {
})
const td_style = R.merge(td_th_style, {
})

export const TD = ({children, value, width, style, className, ...props}: any) => <td className={ className } style={ { width: `${width}px`, ...td_style, ...(style || {}) } } {...props}>{children || value}</td>
export const TH = ({children, value, width, style, className, onClick = (() => {})}: any) =>
  <th onClick={ onClick } className={ className } style={ { cursor: 'pointer', width: `${width}px`, ...th_style, ...(style || {}) } }>{children || value}</th>
export const TABLE = ({children, ...props}) =>
  <table {...props} className={"main-table " + props.className || '' } style={ { width: '100%', backgroundColor: 'white', padding: '20px', fontSize: '14px', color: '#1e1e1e', ...(props.style || {}) } } cellSpacing="0" cellPadding="0">
    { children }
  </table>

  /* <table style={ { width: `${props.width}px`, backgroundColor: 'white', marginBottom: '2em', color: 'black', fontFamily: 'Osaka, CONSOLAS, monospace', ...(props.style || {}) } } cellSpacing="0" cellPadding="0">
    { props.children }*/