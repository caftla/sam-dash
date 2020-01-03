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
        show_label_row('Unique Users', 'total_users')
      , () => onSort('row', 'total_users', 1)
      , x => d3.format(',')(x.total_users) 
      , data => d3.format(',')(data.total_users)
    ),
    pcolumn(
      show_label_row('Paying Users', 'paying_users_rate')
    , () => onSort('row', 'paying_users_rate', 1)
    , x => d3.format('.1%')(x.paying_users_rate) 
    , data => d3.format('.1%')(data.paying_users_rate)
    ),
    column(
        show_label_row('Total', 'total_transactions')
      , () => onSort('row', 'total_transactions', 1)
      , x => d3.format(',')(x.total_transactions) 
      , data => d3.format(',')(data.total_transactions)
    ),
    column(
        show_label_row('Delivered', 'total_delivered')
      , () => onSort('row', 'total_delivered', 1)
      , x => d3.format(',')(x.total_delivered) 
      , data => d3.format(',')(data.total_delivered)
    ),
    column(
        show_label_row('Pending', 'total_pending')
      , () => onSort('row', 'total_pending', 1)
      , x => d3.format(',')(x.total_pending) 
      , data => d3.format(',')(data.total_pending)
    ),
    column(
        show_label_row('Failed', 'total_failed')
      , () => onSort('row', 'total_failed', 1)
      , x => d3.format(',')(x.total_failed) 
      , data => d3.format(',')(data.total_failed)
    ),
    column(
        show_label_row('Refunded', 'total_refunded')
      , () => onSort('row', 'total_refunded', 1)
      , x => d3.format(',')(x.total_refunded) 
      , data => d3.format(',')(data.total_refunded)
    ),
    pcolumn(
        show_label_row('Delivered', 'delivered_rate')
      , () => onSort('row', 'delivered_rate', 1)
      , x => d3.format('.1%')(x.delivered_rate)
      , data => d3.format('.1%')(data.delivered_rate)
    ),
    // pcolumn(
    //     show_label_row('Failed', 'failed_rate')
    //   , () => onSort('row', 'failed_rate', 1)
    //   , x => d3.format('.1%')(x.failed_rate)
    //   , data => d3.format('.1%')(data.failed_rate)
    // ),
    column(
      show_label_row('Med Delivered / Paying User', 'median_delivered_per_paying_user')
    , () => onSort('row', 'median_delivered_per_paying_user', 1)
    , x => d3.format(',')(x.median_delivered_per_paying_user) 
    , data => d3.format(',')(data.median_delivered_per_paying_user)
    ),
    column(
      show_label_row('Avg Delivered / Paying User', 'avg_delivered_per_paying_user')
    , () => onSort('row', 'avg_delivered_per_paying_user', 1)
    , x => d3.format('.1f')(x.avg_delivered_per_paying_user) 
    , data => d3.format('.1f')(data.avg_delivered_per_paying_user)
    ),
    column(
      show_label_row('Transactions / Paying User', 'avg_count_of_transactions_for_a_paying_user')
    , () => onSort('row', 'avg_count_of_transactions_for_a_paying_user', 1)
    , x => d3.format('.1f')(x.avg_count_of_transactions_for_a_paying_user) 
    , data => d3.format('.1f')(data.avg_count_of_transactions_for_a_paying_user)
    ),
    column(
      show_label_row('Avg Tariff / Paying User', 'avg_tariff_per_paying_user')
    , () => onSort('row', 'avg_tariff_per_paying_user', 1)
    , x => d3.format('.1f')(x.avg_tariff_per_paying_user) 
    , data => d3.format('.1f')(data.avg_tariff_per_paying_user)
    ),
  ])
})
