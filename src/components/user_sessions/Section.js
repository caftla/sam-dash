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
      show_label_row('Click', 'click_or_touch_ratio')
      , () => onSort('row', 'click_or_touch_ratio', 1)
      , x => d3.format('0.2f')(100 * x.click_or_touch_ratio)
      , data => d3.format('0.2f')(100 * data.click_or_touch_ratio)
    ),
    pcolumn(
      show_label_row('Leads', 'any_leads_ratio')
      , () => onSort('row', 'any_leads_ratio', 1)
      , x => d3.format('0.2f')(100 * x.any_leads_ratio)
      , data => d3.format('0.2f')(100 * data.any_leads_ratio)
    ),
    pcolumn(
        show_label_row('CR S', 'cr')
      , () => onSort('row', 'cr', 1)
      , x => d3.format('0.2f')(100 * x.cr)
      , data => d3.format('0.2f')(100 * data.cr)
    ),
    pcolumn(
      show_label_row('CR P', 'cr_pixels')
      , () => onSort('row', 'cr_pixels', 1)
      , x => d3.format('0.2f')(100 * x.cr_pixels)
      , data => d3.format('0.2f')(100 * data.cr_pixels)
    ),
    pcolumn(
        show_label_row('CQ', 'cq')
      , () => onSort('row', 'cq', 1)
      , x => d3.format('0.0f')(100 * x.cq)
      , data => d3.format('0.0f')(100 * data.cq)
    ),
    pcolumn(
        show_label_row('ReSubs', 'resubs_ratio')
      , () => onSort('row', 'resubs_ratio', 1)
      , x => d3.format('0.0f')(100 * x.resubs_ratio)
      , data => d3.format('0.0f')(100 * data.resubs_ratio)
    ),
    pcolumn(
        show_label_row('Act24', 'active24')
      , () => onSort('row', 'active24', 1)
      , x => d3.format('0.0f')(100 * x.active24)
      , data => d3.format('0.0f')(100 * data.active24)
    ),
    pcolumn(
        show_label_row('Act', 'active')
      , () => onSort('row', 'active', 1)
      , x => d3.format('0.0f')(100 * x.active)
      , data => d3.format('0.0f')(100 * data.active)
    ),
    pcolumn(
      show_label_row('Blocks', 'blocks_ratio')
      , () => onSort('row', 'blocks_ratio', 1)
      , x => d3.format(',.0f')(100 * x.blocks_ratio)
      , data => d3.format(',.0f')(100 * data.blocks_ratio)
    ),
    pcolumn(
      show_label_row('Safe', 'safe_ratio')
      , () => onSort('row', 'safe_ratio', 1)
      , x => d3.format(',.0f')(100 * x.safe_ratio)
      , data => d3.format(',.0f')(100 * data.safe_ratio)
    ),
    column(
      show_label_row('Failed Sales', 'failedsales')
      , () => onSort('row', 'failedsales', 1)
      , x => d3.format(',')(x.failedsales) 
      , data => d3.format(',')(data.failedsales)
    ),
    pcolumn(
      show_label_row('P Sessions', 'premium_sessions_ratio')
      , () => onSort('row', 'premium_sessions_ratio', 1)
      , x => d3.format(',.0f')(100 * x.premium_sessions_ratio)
      , data => d3.format(',.0f')(100 * data.premium_sessions_ratio)
    ),
    pcolumn(
      show_label_row('P Sales', 'premium_sales_ratio')
      , () => onSort('row', 'premium_sales_ratio', 1)
      , x => d3.format(',.0f')(100 * x.premium_sales_ratio)
      , data => d3.format(',.0f')(100 * data.premium_sales_ratio)
    ),
    // pcolumn(
    //   show_label_row('P CR', 'cr_premium')
    //   , () => onSort('row', 'cr_premium', 1)
    //   , x => d3.format('0.2f')(100 * x.cr_premium)
    //   , data => d3.format('0.2f')(100 * data.cr_premium)
    // ),
    pcolumn(
        show_label_row('Pixels', 'pixels_ratio')
      , () => onSort('row', 'pixels_ratio', 1)
      , x => d3.format('0.0f')(100 * x.pixels_ratio)
      , data => d3.format('0.0f')(100 * data.pixels_ratio)
    ),
    pcolumn(
      show_label_row('Bad Pxls', 'bad_pixels_ratio')
      , () => onSort('row', 'bad_pixels_ratio', 1)
      , x => d3.format('0.0f')(100 * x.bad_pixels_ratio)
      , data => d3.format('0.0f')(100 * data.bad_pixels_ratio)
    ),
    pcolumn(
      show_label_row('Missed Good Pxls', 'missed_good_pixels_ratios')
      , () => onSort('row', 'missed_good_pixels_ratios', 1)
      , x => d3.format('0.0f')(100 * x.missed_good_pixels_ratios)
      , data => d3.format('0.0f')(100 * data.missed_good_pixels_ratios)
    ),
    column(
        show_label_row('eCPA', 'ecpa')
      , () => onSort('row', 'ecpa', 1)
      , x => d3.format('0.2f')(x.ecpa)
      , data => d3.format('0.2f')(data.ecpa)
    ),
    column(
      show_label_row('EPC', 'EPC')
    , () => onSort('row', 'epc', 1)
    , x => d3.format('0.4f')(x.epc)
    , data => d3.format('0.2f')(data.epc)
    ),
    column(
        show_label_row('CPA', 'cpa')
      , () => onSort('row', 'cpa', 1)
      , x => d3.format('0.2f')(x.cpa)
      , data => d3.format('0.2f')(data.cpa)
    ),
    column(
        show_label_row('Cost', 'cost')
      , () => onSort('row', 'cost', 1)
      , x => d3.format(',.0f')(x.cost)
      , data => d3.format(',.0f')(data.cost)
    )
  ])
})
