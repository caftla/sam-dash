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
        show_label_row(params.row, 'row')
      , () => onSort('row', 'row', 1)
      , x => formatter(params.row)(x.row)
      , data => ''
      , { width: width(params.row) }
    ),
    column(
        show_label_row('Sales', 'sales')
      , () => onSort('row', 'sales', 1)
      , x => d3.format(',')(x.sales) 
      , data => d3.format(',')(data.sales)
    ),
    pcolumn(
      show_label_row('ReSub%', 'resubs')
      , () => onSort('row', 'resubs', 1)
      , x => d3.format('0.0f')(100 * x.resubs_ratio)
      , data => d3.format('0.0f')(100 * data.resubs_ratio)
    ),
    pcolumn(
      show_label_row('CQ%', 'cq')
      , () => onSort('row', 'cq', 1)
      , x => d3.format('0.0f')(100 * x.cq)
      , data => d3.format('0.0f')(100 * data.cq)
    ),    
    pcolumn(
      show_label_row('CQAct24%', 'cqact24')
      , () => onSort('row', 'cqact24', 1)
      , x => d3.format('0.0f')(100 * x.firstbillings_and_active24)
      , data => d3.format('0.0f')(100 * data.firstbillings_and_active24)
    ),
    pcolumn(
      show_label_row('Act%', 'act')
      , () => onSort('row', 'act', 1)
      , x => d3.format('0.0f')(x.active * 100)
      , data => d3.format('0.0f')(data.active * 100)
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
    ),
    column(
        show_label_row('Week1', 'arpu_week_1')
      , () => onSort('row', 'arpu_week_1', 1)
      , x => d3.format('0.2f')(x.arpu_week_1)
      , data => d3.format('0.2f')(data.arpu_week_1)
    ),
    column(
        show_label_row('Week2', 'arpu_week_2')
      , () => onSort('row', 'arpu_week_2', 1)
      , x => d3.format('0.2f')(x.arpu_week_2)
      , data => d3.format('0.2f')(data.arpu_week_2)
    ),
  ].concat(R.range(1,12).map(m => column(
    show_label_row(`Month${m}`, `arpu_month_${m}`)
    , () => onSort('row', `arpu_month_${m}`, 1)
    , x => empty_null(d3.format('0.2f'))(x[`arpu_month_${m}`]) // x[`arpu_month_${m}`] > x.ecpa ? '*' : '')
    , data => empty_null(d3.format('0.2f'))(data[`arpu_month_${m}`])
    , { style: x => x[`arpu_month_${m}`] > x.ecpa ? { color: 'green' } : {} }
  ))))
})
