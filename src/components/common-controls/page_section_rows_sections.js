//@flow
import React from 'react'
const d3 = require('d3-format')
import R from 'ramda'
import {TD, TH, TABLE} from '../plottables/table'
import type { QueryParams } from 'my-types'
import type { SorterState } from '../reducers/sort.js'

const change_sign = (change) => {
  const r = Math.round(Math.abs(change) - 1.5)
  const sign = r > 0 ? R.repeat(change > 0 ? '+' : '-', r).join('') : ''
  return sign.substr(0, 4)
}

export default function({columns_maker, cell_formatter, try_merge_body_and_footer, footer}) {

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
      const to_f = (p, x) => typeof p == 'function' ? p(x) : p || {}
      const width = typeof(more.width) == 'number' ? more.width :  100
      return {
        th: <TH {...more} width={ width } value={ label } onClick={ onClick } />
      , td: (x, i) => <TD {...more} data-is-empty={ value(x) == '' } style={ to_f(more.style, x) } width={ width } value={ value(x) } 
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
      , tf: (data) => <TD {...more} style={ R.merge(to_f(more.style, data), { 'font-weight': 'bold' }) } width={ width }  value={ footer(data) } />
      }
    }

    const pcolumn = (label, onClick, value, footer, more = {}) => column(label, onClick, value, footer, {...more, className: 'percent'})
    const tcolumn = (label, onClick, value, footer, more = {}) => column(label, onClick, value, footer, {...more, className: 'times'})

    const width = p => 
      p == '-' ? 10
      : p == 'country_code' ? 80
      : p == 'day' ? 120
      : p == 'hour' ? 220
      : 170

    const columns = columns_maker({params, data, pcolumn, tcolumn, column, show_label_section, show_label_row, formatter, width, onSort})

    const ldata = data.data // R.take(10, data.data)
    return <TABLE width={1400} className="fpsr_table" style={ { minWidth: '1200px', marginTop: '1em' } }>
      <colgroup>
        <col span="1" style={ { width: '170px' } } />
      </colgroup>
      <thead>
        { columns.map((c, i) => c.th) } 
      </thead>
      <tbody>
        { !!try_merge_body_and_footer && ldata.length == 1 ? '' : ldata.map((x, i) => { 
          return <tr data-row={ x.row } key={i}
            onMouseEnter={ () => 
              [...document.querySelectorAll(`tr[data-row="${x.row}"]`)].map(tr => 
                tr.classList.add(`highlight`)
              )
            } 
            onMouseLeave={ () => 
              [...document.querySelectorAll(`tr[data-row="${x.row}"]`)].map(tr => 
                tr.classList.remove(`highlight`)
              )
            } 
          >
            { columns.map((c, i) => c.td(x, i)) }
          </tr> })
        } 
        <tr>
          { columns.map((c, i) => c.tf(ldata.length == 1 && !!try_merge_body_and_footer ? try_merge_body_and_footer(data, ldata[0]) : data)) }
        </tr>
      </tbody>
      {
        !!footer ? (<tfoot>
            <tr>
              <td colSpan={ columns.length  }>{footer(data)}</td>
            </tr>
          </tfoot>) : ''
      }

    </TABLE>
  }

  return Section
}
