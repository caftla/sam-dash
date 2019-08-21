import React from "react";
import ReactTable from "react-table";
import "react-table/react-table.css";
import "./View.css"
import Tooltip from "./Tooltip";
import parseFlowEvents from "./parse-flow-events";
import "./styles.styl"
import R from 'ramda'

const calc_metrics = [
  { lens: R.lens(R.prop('arpu'), (a, s) => R.assoc('arpu', s.total_revenue_from_this_cohort_by_this_row / s.sales, s)), label: 'ARPU' }
, { lens: R.lens(R.prop('transactions_per_sale'), (a, s) => R.assoc('transactions_per_sale', s.total / s.sales, s)), label: 'Transactions per Sale' }
, { lens: R.lens(R.prop('delivery_rate'), (a, s) => R.assoc('delivery_rate', s.delivered / s.total, s)), label: 'Delivery Rate' }
,   { lens: R.lens(R.prop('avg_billing_value'), (a, s) => R.assoc('avg_billing_value', s.revenue / s.delivered, s)), label: 'AVG Billing Value' }
]

const base_metric =  { lens: R.lensProp('sales'), label: 'Sales' } 
const resolution_dimension =  {lens: R.lensProp('days_after_sale') } 
const cohort_dimension =  {lens: R.lensProp('sale_date') }

export default ({ data }) => {
  if (!data || data.length == 0)
    return <div>Empty</div>

  const d3 = window.Plotly.d3

  const cohorts = R.map(R.over(cohort_dimension.lens, x => new Date(x)))(data)

  const cohorts_indexed = R.pipe(
    R.groupBy(
      R.pipe(R.view(cohort_dimension.lens), x => x.valueOf().toString())
    )
    , R.mapObjIndexed(R.pipe(
      R.groupBy(
        R.pipe(R.view(resolution_dimension.lens), x => x.toString())
      )
      , R.map(R.view(R.lensIndex(0)))
    ))
  )(cohorts)

  const interval = R.pipe(
    R.map(R.view(cohort_dimension.lens))
    , R.uniq
    , R.sortBy(x => x)
    , R.scan(({ window, result }, a) => {
      const nwindow = R.take(2, [a].concat(window))
      return {
        window: nwindow
        , result: nwindow.length == 2 ? nwindow[0] - nwindow[1] : null
      }
    }, { window: [], result: null })
    , R.map(x => x.result)
    , R.filter(x => !!x)
    , R.groupBy(x => x)
    , R.map(d => d.length)
    , R.toPairs
    , R.sortBy(([_, count]) => count * -1)
    , R.head
    , ([interval, _]) => parseInt(interval)
  )(cohorts)

  const resolution = R.pipe(
    R.map(R.view(resolution_dimension.lens))
    , R.uniq
    , R.sortBy(x => x)
    , R.scan(({ window, result }, a) => {
      const nwindow = R.take(2, [a].concat(window))
      return {
        window: nwindow
        , result: nwindow.length == 2 ? nwindow[0] - nwindow[1] : null
      }
    }, { window: [], result: null })
    , R.map(x => x.result)
    , R.filter(x => !!x)
    , R.groupBy(x => x)
    , R.map(d => d.length)
    , R.toPairs
    , R.sortBy(([_, count]) => count * -1)
    , R.head
    , ([interval, _]) => parseInt(interval)
  )(cohorts)

  const all_time_dimension_values = (() => {
    const [min, max] = d3.extent(cohorts, R.view(cohort_dimension.lens));
    const days = (max - min) / interval
    return d3.range(0, days + 1).map(x => new Date(x * interval + min.valueOf()))
  })()

  const dimensions = (() => {
    const [min, max] = d3.extent(cohorts, R.view(resolution_dimension.lens))
    return R.range(min, max + 1).filter(d => d % resolution == 0)
  })()

  const vis_data = R.pipe(
    R.chain(
      s => R.map(
        d => {
          return (cohorts_indexed[s.valueOf().toString()] || {})[d.toString()]
            || R.pipe(
              R.set(cohort_dimension.lens, s)
              , R.set(resolution_dimension.lens, d)
              , R.set(base_metric.lens,
                R.view(base_metric.lens, (cohorts_indexed[s.valueOf().toString()] || {})["0"]))
            )({
              current_date: new Date(new Date(s).valueOf() + d * 86400000).toJSON()
              // , sales: R.view(base_metric.lens, (cohorts_indexed[s.valueOf().toString()] || {})["0"] ) //cohorts.find(c => c.sale_date.valueOf() == s.valueOf()) ) 
            })
        }
        , dimensions)
    )
    , R.groupBy(R.pipe(R.view(cohort_dimension.lens), x => x.valueOf()))
    , R.toPairs
    , R.map(([cohort, data]) => {
      const base = R.view(base_metric.lens, data[0]) || NaN
      return R.pipe(
        R.set(cohort_dimension.lens, cohort)
        , R.set(base_metric.lens, base)
      )({
        data: data.map(R.pipe(...calc_metrics.map(m => R.set(m.lens, null))))
      })
    })
  )(all_time_dimension_values)

  const onMouseOver = (i, d) => {
    d3.select('#cohorts-table')
      .selectAll(`[data-col='${i}']`)
      .filter(':not([data-selected])')
      .style('background-color', '#eeeeff')
    d3.select('#cohorts-table')
      .selectAll(`[data-diag='${(d.current_date || '').split('T')[0]}']`)
      .filter(':not([data-selected])')
      .style('background-color', '#aaeeff')
  }
  const onMouseOut = (i, d) => {
    d3.select('#cohorts-table')
      .selectAll(`[data-col='${i}']`)
      .filter(':not([data-selected])')
      .style('background-color', 'inherit')
    d3.select('#cohorts-table')
      .selectAll(`td[data-diag='${(d.current_date || '').split('T')[0]}']`)
      .filter(':not([data-selected])')
      .style('background-color', 'inherit')
    d3.select('#cohorts-table')
      .selectAll(`th[data-diag='${(d.current_date || '').split('T')[0]}']`)
      .filter(':not([data-selected])')
      .style('background-color', 'white')
  }



  return <div >
    <div style={{}}>
      <input name="current_date" type="date" onChange={(e) => {
        d3.select('#cohorts-table').selectAll(`[data-selected]`)
          .style('background-color', 'inherit')
          .attr('data-selected', null)
        d3.select('#cohorts-table').selectAll(`[data-diag='${e.target.value}']`)
          .style('background-color', '#ddffee')
          .attr('data-selected', true)
      }} />
    </div>
    <div style={{ width: 'auto', height: 'auto', overflow: 'auto' }}>
      <table id="cohorts-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '75%', marginTop: '30px' }}>
        <thead>
          {
            ['Cohort', base_metric.label].concat(vis_data[0].data.map(R.view(resolution_dimension.lens)))
              .map((d, i) => <th
                // data-col={i - 2}
                style={{
                  textAlign: 'center',
                  position: 'sticky',
                  zIndex: i < 2 ? '2' : '1',
                  left: i == 0 ? '0' : i === 1 ? '7em' : 'auto',
                  top: 0,
                  backgroundColor: 'white'
                }}>{d}</th>)
          }
        </thead>
        <tbody>
          {vis_data.map((d, i) =>
            <tr className='js-hover' data-row={i}
              onMouseOver={() => {
                d3.select('#cohorts-table')
                  .selectAll(`[data-row='${i}'],[data-row='${i}']>th`)
                  .filter(':not([data-selected])')
                  .style('background-color', '#eeeeff')
              }}
              onMouseOut={() => {
                d3.select('#cohorts-table')
                  .selectAll(`[data-row='${i}']`)
                  .filter(':not([data-selected])')
                  .style('background-color', 'inherit')
                d3.select('#cohorts-table')
                  .selectAll(`[data-row='${i}']>th`)
                  .filter(':not([data-selected])')
                  .style('background-color', 'white')
              }}
            >
              <th data-diag={`${(d.data[0].current_date || '').split('T')[0]}`} className={`data-col data-col-${i}`} style={{ minWidth: '7em', position: 'sticky', zIndex: 1, left: 0, backgroundColor: 'white' }}
                onMouseOver={() => onMouseOver(-2, d.data[0])}
                onMouseOut={() => onMouseOut(-2, d.data[0])}
              >
                {new Date(+R.view(cohort_dimension.lens)(d)).toJSON().split('T')[0]}
              </th>
              <th data-diag={`${(d.data[0].current_date || '').split('T')[0]}`} className={`data-col data-col-${i}`} style={{ minWidth: '7em', position: 'sticky', zIndex: 1, left: '7em', backgroundColor: 'white', borderRight: 'solid 1px #eee' }}
                onMouseOver={() => onMouseOver(-1, d.data[0])}
                onMouseOut={() => onMouseOut(-1, d.data[0])}
              >
                {R.view(base_metric.lens, d)}
              </th>
              {
                d.data.map((d, i) =>
                  <td
                    data-diag={`${(d.current_date || '').split('T')[0]}`}
                    data-col={i}
                    style={{
                      minWidth: '14em', borderRight: 'solid 1px silver',
                      borderBottom: 'solid 1px #eeeeeff',
                      paddingLeft: '0.5em'
                    }}
                    onMouseOver={() => onMouseOver(i, d)}
                    onMouseOut={() => onMouseOut(i, d)}
                  >
                    <table style={{ width: '100%' }}>
                      <tr className='js-hover'>
                        {
                          [{ label: 'Total Transactions', value: d.total }
                            , {
                              label: 'Attempts / Sales base', value:
                                isNaN(d.activley_attempted_users) ? '' :
                                  d3.format('0.0%')(d.activley_attempted_users / d.sales)
                          }
                            , { label: 'Delivery Rate', value: isNaN(d.delivery_rate) ? '' : d3.format('0.2%')(d.delivery_rate) }
                            // , {label: 'SUM Tariff / Sales base', value: 
                            //    isNaN(d.arpu) ? '' :
                            //    d3.format('.2f')(d.arpu)}
                          ].map(d =>
                            <td title={d.label} style={{ width: '4em' }}>
                              {d.value}
                            </td>
                          )
                        }
                      </tr>
                    </table>
                  </td>
                )
              }
            </tr>
          )}
        </tbody>
      </table>
    </div>
  </div>
}
