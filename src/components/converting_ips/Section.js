//@flow
import React from 'react'
const d3 = require('d3-format')
import R from 'ramda'
import {TD, TH, TABLE} from '../plottables/table'
import cell_formatter from './cell-formatter'
import './Section.styl'
import Section from '../common-controls/page_section_rows_sections'
import calculator from 'ip-subnet-calculator'

const empty_null = format => x => x == null ? '' : format(x)

export default Section({
  cell_formatter, 
  try_merge_body_and_footer: (section, row) => R.merge(section, { operator_code: row.operator_code}),
  footer: data => <pre style={ { overflow: 'auto', 'white-space': 'pre-wrap' } }>{ 
      R.pipe(
          R.map(x => `${x.ipLowStr}/${x.prefixSize}`)
        , R.join(', ')
      )(calculator.calculate(data.ip3From + '.0', data.ip3To + '.255'))
    }</pre>,
  columns_maker: ({params, data, pcolumn, tcolumn, column, show_label_section, show_label_row, formatter, width, onSort}) => ([
    column(
        show_label_row('From', 'ip3From')
      , () => onSort('row', 'ip3From', 1)
      , x => !x.ip3From ? '' : x.ip3From + '.0'
      , data => data.ip3From + '.0'
    ),
    column(
        show_label_row('To', 'ip3To')
      , () => onSort('row', 'ip3To', 1)
      , x => !x.ip3To ? '' : x.ip3To + '.255'
      , data => data.ip3To + '.255'
    ),
    column(
        show_label_row('Operator', 'operator_code')
      , () => onSort('row', 'operator_code', 1)
      , x => (x.operator_code)
      , data => (data.operator_code)
    ),
    column(
        show_label_row('Views', 'views')
      , () => onSort('row', 'views', 1)
      , x => isNaN(x.views) ? '' : d3.format(',')(x.views) 
      , data => d3.format(',')(data.views)
    ),
    column(
        show_label_row('Sales', 'sales')
      , () => onSort('row', 'sales', 1)
      , x => d3.format(',')(x.sales) 
      , data => d3.format(',')(data.sales)
    ),
    pcolumn(
        show_label_row('CR S', 'cr')
      , () => onSort('row', 'cr', 1)
      , x => isNaN(x.cr) ? '' : d3.format('0.2f')(100 * x.cr)
      , data => d3.format('0.2f')(100 * data.cr)
    ),
    pcolumn(
        show_label_row('CQ', 'cq')
      , () => onSort('row', 'cq', 1)
      , x => d3.format('0.0f')(100 * x.cq)
      , data => d3.format('0.0f')(100 * data.cq)
    ),
    column(
        show_label_row('eCPA', 'ecpa')
      , () => onSort('row', 'ecpa', 1)
      , x => isNaN(x.ecpa) ? '' : d3.format('0.2f')(x.ecpa)
      , data => d3.format('0.2f')(data.ecpa)
    ),
    column(
        show_label_row('CPA', 'cpa')
      , () => onSort('row', 'cpa', 1)
      , x => isNaN(x.cpa) ? '' : d3.format('0.2f')(x.cpa)
      , data => d3.format('0.2f')(data.cpa)
    )
  ])
})
