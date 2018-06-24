import React from 'react'
import R from 'ramda'
const d3 = require('d3-format')
import {TD, TH, TABLE} from '../plottables/table'
import ARPUChart from "./Charts/ARPUChart";
import BreakevenChart from "./Charts/BreakevenChart";
import RevenueCostChart from "./Charts/RevenueCostChart";

const format_arpu = x => x == null ? '' : d3.format('0.2f')(x)

const chart_container_styles = {
  display: 'flex',
  flexDirection: 'row-reverse'
}

const chart_title_styles = {
  overflow: 'visible',
  textAlign: 'center',
  width: '40px',
  height: '400px',
  position: 'relative',
  display: 'inline-block'
}

const chart_title_h4_styles = {
  position: 'absolute',
  top: 'calc(50% - 2ex)',
  left: '50%',
  whiteSpace: 'nowrap',
  margin: '0 0',
  padding: '0 0',
  transform: 'translateX(-50%) translateY(-50%) rotate(-90deg)'
}


class Page extends React.Component {
  state = {
    charts_visible: false
  }
  constructor(props){
    super(props)
  }

  render() {
    const {page, sales, data, params, onSort, sort, chart_data} = this.props
    
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
  
    const chart_component = <div style={ {margin: '0 auto 0 0', maxWidth: '1280px', textAlign: 'left'} }>
      { !chart_data
        ? <div>Loading Chart Data...</div>
        
        : !this.state.charts_visible
        ? <div>
            <button style={{float: 'left'}} onClick={ () => this.setState({ charts_visible: true })}>Show Charts</button>
          </div>
        : <div>
          <div className="chart-container" style={chart_container_styles}>
            <div className="chart-title" style={chart_title_styles}><h4 style={ chart_title_h4_styles }>ARPU / eCPA and Sales</h4></div>
            <ARPUChart data={chart_data.data} />
          </div>
          <div className="chart-container" style={chart_container_styles}>
            <div className="chart-title" style={{ ...chart_title_styles, height: '250px' }}><h4 style={ chart_title_h4_styles }>Breakeven</h4></div>
            <BreakevenChart data={chart_data.data} />
          </div>
          <div className="chart-container" style={chart_container_styles}>
            <div className="chart-title" style={{...chart_title_styles, height: '250px' }}><h4 style={ chart_title_h4_styles }>Revenue and Cost</h4></div>
            <RevenueCostChart data={chart_data.data} />
          </div>
        </div>
      }
    </div>
  
  
    return <div>
      <TABLE width={1020} style={{marginTop: '1em'}} data-id={ page }>
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
      <div>
        { chart_component }
      </div>
    </div>
  }
}

const render_page = ({page, sales, data, params, onSort, sort, chart_data} :
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

  const chart_component = <div>
    { !!chart_data
      ? <div>
          <ARPUChart data={chart_data.data} />
          <BreakevenChart data={chart_data.data} />
        </div>

      : <div>NO__CHART_DATA</div>
    }
  </div>


  return <div>
    <TABLE width={1020} style={{marginTop: '1em'}} data-id={ page }>
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
    <div>
      { chart_component }
    </div>
  </div>
}


export default Page