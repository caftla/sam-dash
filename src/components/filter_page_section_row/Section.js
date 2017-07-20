//@flow
import React from 'react'
const d3 = require('d3-format')
import R from 'ramda'
import {TD, TH, TABLE} from '../plottables/table'
import type { QueryParams } from 'my-types'
import cell_formatter from './cell-formatter'
import type { SorterState } from '../reducers/sort.js'
import './Section.styl'

const change_sign = (change) => {
  const r = Math.round(Math.abs(change) - 1.5)
  const sign = r > 0 ? R.repeat(change > 0 ? '+' : '-', r).join('') : ''
  return sign.substr(0, 4)
}

const Section = ({data, params, onSort, sort, affiliates} : { data : any, params : QueryParams, onSort: (string, number) => void, sort: SorterState, affiliates: Object }) => {
  const show_label = (row_or_section) => (name, key = null) => {
    const sort_field = key == null ? name : key
    const sname = name == 'country_code' ? 'country' : name
    const sorter = sort[row_or_section == 'row' ? 'rowSorter' : 'sectionSorter']
    return sort_field == sorter.field && sname != '-'
      ? `${sname} ` + (sorter.order > 0 ? '▲' : '▼')
      : sname
  }
  const show_label_row = show_label('row') 
  const show_label_section = show_label('section') 
  const formatter = cell_formatter(affiliates, params.timezone)

  const column = (label, onClick, value, footer, more = {}) => {
    const width = typeof(more.width) == 'number' ? more.width :  100
    return {
      th: <TH {...more} width={ width } value={ label } onClick={ onClick } />
    , td: (x, i) => <TD {...more} width={ width } value={ value(x) } 
        onMouseEnter={ () => 
          [...document.getElementsByClassName('fpsr_table')].map(table => 
            table.classList.add(`highlight-${i+1}`)
          )
        } 
        onMouseLeave={ () => 
          [...document.getElementsByClassName('fpsr_table')].map(table => 
            table.classList.remove(`highlight-${i+1}`)
          )
        } 
      />
    , tf: (data) => <TD {...more} style={ R.merge(more.style || {}, { 'font-weight': 'bold' }) } width={ width }  value={ footer(data) } />
    }
  }

  const pcolumn = (label, onClick, value, footer, more = {}) => column(label, onClick, value, footer, {...more, className: 'percent'})

  const width = p => 
    p == '-' ? 10
    : p == 'country_code' ? 80
    : p == 'day' ? 120
    : p == 'hour' ? 220
    : 170

  const columns = [
    column(
        show_label_section(params.section, 'section')
      , () => onSort('section', 'section', 1)
      , x => formatter(params.section)(x.section)
      , data => formatter(params.section)(data.section)
      , { width: width(params.section), style: {  paddingLeft: '0.7em' } }
    ), 
    column(
        show_label_row(params.row, 'row')
      , () => onSort('row', 'row', 1)
      , x => formatter(params.row)(x.row)
      , data => ''
      , { width: width(params.row) }
    ),
    column(
        show_label_row('Views', 'views')
      , () => onSort('row', 'views', 1)
      , x => d3.format(',')(x.views) 
      , data => d3.format(',')(data.views)
    ),
    column(
        show_label_row('Sales', 'sales')
      , () => onSort('row', 'sales', 1)
      , x => d3.format(',')(x.sales) 
      , data => d3.format(',')(data.sales)
    ),
    column(
        show_label_row('Pixels', 'pixels')
      , () => onSort('row', 'pixels', 1)
      , x => d3.format(',')(x.pixels) 
      , data => d3.format(',')(data.pixels)
    ),
    pcolumn(
        show_label_row('CR S%', 'cr')
      , () => onSort('row', 'cr', 1)
      , x => d3.format('0.2f')(100 * x.cr)
      , data => d3.format('0.2f')(100 * data.cr)
    ),
    pcolumn(
        show_label_row('CR P%', 'pixels_cr')
      , () => onSort('row', 'pixels_cr', 1)
      , x => d3.format('0.2f')(100 * x.pixels_cr)
      , data => d3.format('0.2f')(100 * data.pixels_cr)
    ),
    pcolumn(
        show_label_row('CQ%', 'cq')
      , () => onSort('row', 'cq', 1)
      , x => d3.format('0.0f')(100 * x.cq)
      , data => d3.format('0.0f')(100 * data.cq)
    ),
    pcolumn(
        show_label_row('ReSub%', 'resubrate')
      , () => onSort('row', 'resubrate', 1)
      , x => d3.format('0.0f')(100 * x.resubrate)
      , data => d3.format('0.0f')(100 * data.resubrate)
    ),
    pcolumn(
        show_label_row('Active24%', 'active24')
      , () => onSort('row', 'active24', 1)
      , x => d3.format('0.0f')(100 * x.active24)
      , data => d3.format('0.0f')(100 * data.active24)
    ),
    pcolumn(
        show_label_row('Active%', 'active')
      , () => onSort('row', 'active', 1)
      , x => d3.format('0.0f')(100 * x.active)
      , data => d3.format('0.0f')(100 * data.active)
    ),
    pcolumn(
        show_label_row('Pixels%', 'pixels_ratio')
      , () => onSort('row', 'pixels_ratio', 1)
      , x => d3.format('0.0f')(100 * x.pixels_ratio)
      , data => d3.format('0.0f')(100 * data.pixels_ratio)
    ),
    column(
        show_label_row('eCPA', 'ecpa')
      , () => onSort('row', 'ecpa', 1)
      , x => d3.format('0.2f')(x.ecpa)
      , data => d3.format('0.2f')(data.ecpa)
    ),
    column(
        show_label_row('CPA', 'home_cpa')
      , () => onSort('row', 'home_cpa', 1)
      , x => d3.format('0.2f')(x.home_cpa)
      , data => d3.format('0.2f')(data.home_cpa)
    ),
    column(
        show_label_row('Cost', 'cost')
      , () => onSort('row', 'cost', 1)
      , x => d3.format(',.0f')(x.cost)
      , data => d3.format(',.0f')(data.cost)
    )
  ]

  return <TABLE width={1400} className="fpsr_table">
    <thead>
      { columns.map((c, i) => c.th) } 
    </thead>
    <tbody>
      { data.data.map((x, i) => <tr key={i}>
          { columns.map((c, i) => c.td(x, i)) }
        </tr>)
      } 
      <tr>
        { columns.map((c, i) => c.tf(data)) }
      </tr>
    </tbody>
  </TABLE>
}

export default Section
