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

  const Section = ({data, params, onSort, sort, affiliates, is_summary} : { data : any, params : QueryParams, onSort: (string, number) => void, sort: SorterState, affiliates: Object }) => {

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
      const val = R.pipe(value, x => x == '-' ? '' : x)
      return {
        label: label
      , th: <TH {...more} value={ label == '-' ? '' : label } onClick={ onClick } />
      , td: (x, i) => <TD {...more} data-is-empty={ value(x) == '' } style={ to_f(more.style, x) } value={ val(x) } 
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
      , tf: (data) => <TD {...more} style={ R.merge(to_f(more.style, data), { 'font-weight': 'bold' }) } value={ footer(data) } />
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

    const columns = R.pipe(
      cs => is_summary 
        ? [0, 1].map(i => ({label: cs[i].label, th: <TH/>, td: () => <TD />})).concat(R.drop(2, cs))
        : cs
    )(columns_maker({params, data, pcolumn, tcolumn, column, show_label_section, show_label_row, width, formatter, onSort}))

    const ldata = data.data // R.take(10, data.data)
    const tableId = `table-${Math.round(Math.random() * 10000)}`
    return <TABLE width={1400} data-id={ tableId } className={`fpsr_table${ is_summary ? ' summary' : '' }`} style={ { minWidth: '1200px', marginTop: '1em' } }>
      { columns.map((c, i) => (<colgroup key={i}>
          <col span="1" style={ { width: c.label == '-' ? '1%' : c.label == 'Transactions' || c.label == 'Views' ? '7%' : (i < 2 ? '7%' : '5%') } } />
        </colgroup>))
      } 
      <caption align="bottom"  className='clipboard-hover' onClick={ () => {
        const caption = document.querySelectorAll(`table[data-id="${ tableId }"] caption`)[0]
        const html = caption.innerHTML
        caption.innerHTML = `<div style='text-align: left'><a href='${document.location.href}'>Report</a></div>`
        caption.setAttribute('align', 'bottom')
        window.clipboard.copy({"text/html": document.querySelectorAll(`table[data-id="${ tableId }"]`)[0].outerHTML})
        caption.innerHTML = html
        caption.setAttribute('align', 'top')

      } }>
      </caption>
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
          { is_summary ? '' : columns.map((c, i) => c.tf(ldata.length == 1 && !!try_merge_body_and_footer ? try_merge_body_and_footer(data, ldata[0]) : data)) }
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
