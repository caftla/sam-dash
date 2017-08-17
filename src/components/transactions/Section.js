//@flow
import React from 'react'
const d3 = require('d3-format')
import R from 'ramda'
import {TD, TH, TABLE} from '../plottables/table'
import cell_formatter from './cell-formatter'
import './Section.styl'
import Section from '../common-controls/page_section_rows_sections'

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
        show_label_row('Total', 'total')
      , () => onSort('row', 'total', 1)
      , x => d3.format(',')(x.total) 
      , data => d3.format(',')(data.total)
    ),
    column(
        show_label_row('Delivered', 'delivered')
      , () => onSort('row', 'delivered', 1)
      , x => d3.format(',')(x.delivered) 
      , data => d3.format(',')(data.delivered)
    ),
    column(
        show_label_row('Pending', 'pending')
      , () => onSort('row', 'pending', 1)
      , x => d3.format(',')(x.pending) 
      , data => d3.format(',')(data.pending)
    ),
    column(
        show_label_row('Failed', 'failed')
      , () => onSort('row', 'failed', 1)
      , x => d3.format(',')(x.failed) 
      , data => d3.format(',')(data.failed)
    ),
    column(
        show_label_row('Refunded', 'refunded')
      , () => onSort('row', 'refunded', 1)
      , x => d3.format(',')(x.refunded) 
      , data => d3.format(',')(data.refunded)
    ),
    column(
        show_label_row('Unknown', 'unknown')
      , () => onSort('row', 'unknown', 1)
      , x => d3.format(',')(x.unknown) 
      , data => d3.format(',')(data.unknown)
    ),
    pcolumn(
        show_label_row('Delivered%', 'delivered_rate')
      , () => onSort('row', 'delivered_rate', 1)
      , x => d3.format('0.0f')(100 * x.delivered_rate)
      , data => d3.format('0.0f')(100 * data.delivered_rate)
    ),
    pcolumn(
        show_label_row('Failed%', 'failed_rate')
      , () => onSort('row', 'failed_rate', 1)
      , x => d3.format('0.0f')(100 * x.failed_rate)
      , data => d3.format('0.0f')(100 * data.failed_rate)
    ),
  ])
})
