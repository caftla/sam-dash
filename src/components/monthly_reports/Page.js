import React from 'react'
import R from 'ramda'
const d3 = require('d3-format')
import {TD, TH, TABLE} from '../plottables/table'

const format_arpu = x => x == null ? '' : d3.format('0.2f')(x)

const Page = ({page, sales, data, params, onSort, sort} :
  { page: string, sales: number, data: Array<any>, params: QueryParams, onSort: (string, number) => void, sort: { field: string, order: number } }) => {

  const td = f => data.map((d, i) => <TD key={i}>{f(d)}</TD>)
  const Row = ({label, f, ...props}) => <tr {...props}>
    <TD>{label}</TD>
    { td(f) }
  </tr>

  const TBody = ({children}) => <tbody>
    {children.map((c, i) => R.merge(c, {
        props: R.merge(c.props, {style: { backgroundColor: i % 2 == 0 ? '' : '#f9f9f9' }})
      })
    )}
  </tbody>

  const format_null = (lens, format) => R.pipe(lens, x => x == null || isNaN(x) ? '' : format(x))

  return <TABLE width={1020} style={{marginTop: '1em'}} data-id={ page }>
    <thead>
      <TH width='150' className='clipboard-hover' onClick={ () => {
        window.clipboard.copy({"text/html": document.querySelectorAll(`table[data-id="${ page }"]`)[0].outerHTML})
      } }>{ page }</TH>
        { data.map((d, i) => <TH key={i} width='90'>{d.year_code}-{d.month_code}</TH>) }
      </thead>
    <TBody>
      <Row label='Sales' f={format_null(R.prop('sales'), d3.format(','))} />
      <Row label='Pixels %' f={format_null(x => (x.pixels / x.sales), d3.format('0.0%'))} />
      <Row label='CQ %' f={format_null(x => (x.firstbilling_count / x.sales), d3.format('0.0%'))} />
      <Row label='Active 24 %' f={format_null(x => ((x.sales - x.optout_24h) / x.sales), d3.format('0.0%'))} />
      <Row label='Cost' f={format_null(R.prop('cost'), d3.format(',.0f'))} />
      <Row label='eCPA' f={format_null(x => x.cost / x.sales, d3.format('0.2f'))} />
      <Row label='Net Subscribers Growth' f={format_null(x => (x.sales - x.optouts), d3.format(','))} />
      <Row label='Total Unsubscribers' f={format_null(R.prop('optouts'), d3.format(','))} />
      <Row label='Attempts' f={format_null(R.prop('msg_sent'), d3.format(','))} />
      <Row label='Billed' f={format_null(R.prop('msg_delivered'), d3.format(','))} />
      <Row label='Billed %' f={format_null(x => (x.msg_delivered / x.msg_sent), d3.format('0.0%'))} />
      <Row label='ARPU 7' f={format_null(R.prop('arpu_week_1'), format_arpu)} />
      <Row label='ARPU 30' f={format_null(R.prop('arpu_month_1'), format_arpu)} />
      <Row label='ARPU 60' f={format_null(R.prop('arpu_month_2'), format_arpu)} />
      <Row label='ARPU 90' f={format_null(R.prop('arpu_month_3'), format_arpu)} />
      <Row label='Revenue' f={format_null(R.prop('revenue'), d3.format(',.0f'))} />
    </TBody>
 </TABLE>
}


export default Page