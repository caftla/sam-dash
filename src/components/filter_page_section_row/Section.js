//@flow
import React from 'react'
const d3 = require('d3-format')
import R from 'ramda'
import {TD, TH, TABLE} from '../plottables/table'
import type { QueryParams } from 'my-types'
import cell_formatter from './cell-formatter'

import type { SorterState } from '../reducers/sort.js'

const change_sign = (change) => {
  const r = Math.round(Math.abs(change) - 1.5)
  const sign = r > 0 ? R.repeat(change > 0 ? '+' : '-', r).join('') : ''
  return sign.substr(0, 4)
}

const Section = ({data, params, onSort, sort, affiliates} : { data : any, params : QueryParams, onSort: (string, number) => void, sort: SorterState, affiliates: Object }) => {
  const show_label = (row_or_section) => (name, key = null) => {
    const sort_field = key == null ? name : key
    const sorter = sort[row_or_section == 'row' ? 'rowSorter' : 'sectionSorter']
    return sort_field == sorter.field
      ? `${name} ` + (sorter.order > 0 ? '▲' : '▼')
      : name
  }
  const show_label_row = show_label('row') 
  const show_label_section = show_label('section') 
  const formatter = cell_formatter(affiliates, params.timezone)
  return <TABLE width={1400}>
    <thead>
      <tr>
        <TH width={170} style={{ paddingLeft: '0.7em' }} value={ show_label_section(params.section, 'section') } onClick={ () => onSort('section', 'section', 1) }/>
        <TH width={params.row == 'hour' ? 220 : 160} value={ show_label_row(params.row, 'row') } onClick={ () => onSort('row', 'row', 1) }  />
        <TH width={100} value={ show_label_row('Views', 'views') } onClick={ () => onSort('row', 'views', 1) } />
        <TH width={100} value={ show_label_row('Share%', 'section_sales_ratio') } onClick={ () => onSort('row', 'section_sales_ratio', 1) } />
        <TH width={100} value={ show_label_row('Sales', 'sales') } onClick={ () => onSort('row', 'sales', 1) }/>
        <TH width={100} value={ show_label_row('CR%', 'cr') } onClick={ () => onSort('row', 'cr', 1) }/>
        <TH width={100} value={ show_label_row('CQ%', 'cq') } onClick={ () => onSort('row', 'cq', 1) }/>
        <TH width={100} value={ show_label_row('ReSub%', 'resubrate') } onClick={ () => onSort('row', 'resubrate', 1) }/>
        <TH width={100} value={ show_label_row('Active24%', 'active24') } onClick={ () => onSort('row', 'active24', 1) }/>
        <TH width={100} value={ show_label_row('Active%', 'active') } onClick={ () => onSort('row', 'active', 1) }/>
        <TH width={100} value={ show_label_row('Pixels', 'pixels') } onClick={ () => onSort('row', 'pixels', 1) }/>
        <TH width={100} value={ show_label_row('Pixels%', 'pixels_ratio') } onClick={ () => onSort('row', 'pixels_ratio', 1) }/>
        <TH width={100} value={ show_label_row('eCPA', 'ecpa') } onClick={ () => onSort('row', 'ecpa', 1) }/>
        <TH width={100} value={ show_label_row('CPA', 'home_cpa') } onClick={ () => onSort('row', 'home_cpa', 1) }/>
        <TH width={100} value={ show_label_row('Cost', 'cost') } onClick={ () => onSort('row', 'cost', 1) }/>
      </tr>
    </thead>
    <tbody>{
      data.data.map((x, i) => <tr key={i}>
        <TD width={170}  value={ formatter(params.section)(x.section) } style={{ paddingLeft: '0.7em' }}  />
        <TD width={params.row == 'hour' ? 220 : 160} value={ formatter(params.row)(x.row) } />
        <TD width='100'  value={d3.format(',')(+x.views) + change_sign(+x.views_change)} />
        <TD width={100}  value={d3.format('0.0f')(100 * +x.section_sales_ratio)} />
        <TD width={100}  value={d3.format(',')(+x.sales) + change_sign(+x.sales_change)} />
        <TD width={100}  value={d3.format('0.2f')(100 * +x.cr) + change_sign(+x.cr_change)} />
        <TD width={100}  value={d3.format('0.0f')(100 * +x.cq) + change_sign(+x.cq_change)} />
        <TD width={100}  value={d3.format('0.0f')(100 * +x.resubrate) + change_sign(+x.resubrate_change)} />
        <TD width={100}  value={d3.format('0.0f')(100 * +x.active24) + change_sign(+x.active24_change * 0.5)} />
        <TD width={100}  value={d3.format('0.0f')(100 * +x.active) + change_sign(+x.active_change * 0.5)} />
        <TD width={100}  value={d3.format(',')(+x.pixels) + change_sign(+x.pixels_change)} />
        <TD width={100}  value={d3.format('0.0f')(100 * +x.pixels_ratio) + change_sign(+x.pixels_ratio_change)} />
        <TD width={100}  value={d3.format('0.2f')(+x.ecpa) + change_sign(+x.ecpa_change)} />
        <TD width={100}  value={d3.format(',.2f')(+x.home_cpa) + change_sign(+x.home_cpa_change)} />
        <TD width={100}  value={d3.format(',.0f')(+x.cost) + change_sign(+x.cost_change)} />
      </tr>)
    }
      <tr>
        <TD width={150}  value={ formatter(params.section)(data.section) } style={{ paddingLeft: '0.7em' }}  />
        <TD width={150} value="" />
        <TD width='100'  style={ { fontWeight: 'bold' } } value={d3.format(',')(+data.views) + change_sign(+data.views_change)} />
        <TD width={100}  value="" />
        <TD width={100}  style={ { fontWeight: 'bold' } } value={d3.format(',')(+data.sales) + change_sign(+data.sales_change)} />
        <TD width={100}  style={ { fontWeight: 'bold' } } value={d3.format('.2%')(+data.cr) + change_sign(+data.cr_change)} />
        <TD width={100}  style={ { fontWeight: 'bold' } } value={d3.format('.0%')(+data.cq) + change_sign(+data.cq_change)} />
        <TD width={100}  style={ { fontWeight: 'bold' } } value={d3.format('.0%')(data.resubrate)} />
        <TD width={100}  style={ { fontWeight: 'bold' } } value={d3.format('.0%')(+data.active24) + change_sign(+data.active24_change * 0.5)} />
        <TD width={100}  style={ { fontWeight: 'bold' } } value={d3.format('.0%')(+data.active) + change_sign(+data.active_change * 0.5)} />
        <TD width='100'  style={ { fontWeight: 'bold' } } value={d3.format(',')(+data.pixels) + change_sign(+data.pixels_change)} />
        <TD width={100}  style={ { fontWeight: 'bold' } } value={d3.format('.0%')(+data.pixels_ratio) + change_sign(+data.pixels_ratio_change)} />
        <TD width={100}  style={ { fontWeight: 'bold' } } value={d3.format('0.2f')(+data.ecpa) + change_sign(+data.ecpa_change)} />
        <TD width={100}  style={ { fontWeight: 'bold' } } value={d3.format(',.2f')(+data.home_cpa) + change_sign(+data.home_cpa_change)} />
      <TD width={100}  style={ { fontWeight: 'bold' } } value={d3.format(',.0f')(+data.cost) + change_sign(+data.cost_change)} />
      </tr>
    </tbody>
  </TABLE>
}

export default Section
