//@flow
import React from 'react'
const d3 = require('d3-format')
import R from 'ramda'
import {TD, TH, TABLE} from '../plottables/table'
import cell_formatter from './cell-formatter'
import './Section.styl'
import Section from '../common-controls/page_section_rows_sections'

const empty_null = format => x => x == null ? '' : format(x)

export default Section({
  cell_formatter, 
  columns_maker: ({params, data, pcolumn, tcolumn, column, show_label_section, show_label_row, formatter, width, onSort}) => ([
    column(
        show_label_section(params.section, 'section')
      , () => onSort('section', 'section', 1)
      , x => formatter(params.section)(x.section)
      , data => formatter(params.section)(data.section)
      , { width: width(params.section), style: {  paddingLeft: '0.7em' } }
    ), 
    column(
        show_label_row('From', 'from')
      , () => onSort('row', 'from', 1)
      , x => (x.from)
      , data => (data.from)
    ),
    column(
        show_label_row('To', 'to')
      , () => onSort('row', 'to', 1)
      , x => (x.to)
      , data => (data.to)
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
    pcolumn(
        show_label_row('CR S%', 'cr')
      , () => onSort('row', 'cr', 1)
      , x => d3.format('0.2f')(100 * x.cr)
      , data => d3.format('0.2f')(100 * data.cr)
    ),
    pcolumn(
        show_label_row('CQ%', 'cq')
      , () => onSort('row', 'cq', 1)
      , x => d3.format('0.0f')(100 * x.cq)
      , data => d3.format('0.0f')(100 * data.cq)
    ),
    column(
        show_label_row('eCPA', 'ecpa')
      , () => onSort('row', 'ecpa', 1)
      , x => d3.format('0.2f')(x.ecpa)
      , data => d3.format('0.2f')(data.ecpa)
    ),
    column(
        show_label_row('CPA', 'cpa')
      , () => onSort('row', 'cpa', 1)
      , x => d3.format('0.2f')(x.cpa)
      , data => d3.format('0.2f')(data.cpa)
    )
  ])
})
