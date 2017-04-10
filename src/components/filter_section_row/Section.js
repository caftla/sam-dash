//@flow
import React from 'react'
const d3 = require('d3-format')
import R from 'ramda'
import {TD, TH, TABLE} from '../plottables/table'

console.log('d3', d3)

const change_sign = (change) => {
  const r = Math.round(Math.abs(change) - 1.5)
  const sign = r > 0 ? R.repeat(change > 0 ? '+' : '-', r).join('') : ''
  return sign.substr(0, 4)
}

const Section = ({data} : { data : any }) => <TABLE width={1020}>
  <thead>
    <tr>
      <TH width={150} style={{ paddingLeft: '0.7em' }} />
      <TH width={150} />
      <TH width={90} value="Views" />
      <TH width={90} value="Share%" />
      <TH width={90} value="Sales" />
      <TH width={90} value="CR%" />
      <TH width={90} value="Pixels%" />
      <TH width={90} value="eCPA" />
      <TH width={90} value="CQ%" />
      <TH width={90} value="Active24%" />
    </tr>
  </thead>
  <tbody>{
    data.data.map((x, i) => <tr key={i}>
      <TD width={150}  value={x.section} style={{ paddingLeft: '0.7em' }}  />
      <TD width={150} value={x.row} />
      <TD width='90'  value={d3.format(',')(+x.views) + change_sign(+x.views_change)} />
      <TD width={90}  value={d3.format('0.0f')(100 * +x.section_sales_ratio)} />
      <TD width={90}  value={d3.format(',')(+x.sales) + change_sign(+x.sales_change)} />
      <TD width={90}  value={d3.format('0.2f')(100 * +x.cr) + change_sign(+x.cr_change)} />
      <TD width={90}  value={d3.format('0.0f')(100 * +x.pixels_ratio) + change_sign(+x.pixels_ratio_change)} />
      <TD width={90}  value={d3.format('0.1f')(+x.ecpa) + change_sign(+x.ecpa_change)} />
      <TD width={90}  value={d3.format('0.0f')(100 * +x.cq) + change_sign(+x.cq_change)} />
      <TD width={90}  value={d3.format('0.0f')(100 * +x.active24) + change_sign(+x.active24_change * 0.5)} />
    </tr>)
  }
    <tr>
      <TD width={150}  value={data.section} style={{ paddingLeft: '0.7em' }}  />
      <TD width={150} value="" />
      <TD width='90'  style={ { fontWeight: 'bold' } } value={d3.format(',')(+data.views) + change_sign(+data.views_change)} />
      <TD width={90}  value="" />
      <TD width={90}  style={ { fontWeight: 'bold' } } value={d3.format(',')(+data.sales) + change_sign(+data.sales_change)} />
      <TD width={90}  style={ { fontWeight: 'bold' } } value={d3.format('0.2f')(100 * +data.cr) + change_sign(+data.cr_change)} />
      <TD width={90}  style={ { fontWeight: 'bold' } } value={d3.format('0.0f')(100 * +data.pixels_ratio) + change_sign(+data.pixels_ratio_change)} />
      <TD width={90}  style={ { fontWeight: 'bold' } } value={d3.format('0.1f')(+data.ecpa) + change_sign(+data.ecpa_change)} />
      <TD width={90}  style={ { fontWeight: 'bold' } } value={d3.format('0.0f')(100 * +data.cq) + change_sign(+data.cq_change)} />
      <TD width={90}  style={ { fontWeight: 'bold' } } value={d3.format('0.0f')(100 * +data.active24) + change_sign(+data.active24_change * 0.5)} />
    </tr>
  </tbody>
</TABLE>

export default Section
