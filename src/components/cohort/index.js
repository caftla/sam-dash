import React from 'react'
import { connect } from 'react-redux'

//TODO: temp
import { get } from '../../helpers'

const d3 = require('d3-format')
const {timeFormat} = require('d3-time-format')
import R from 'ramda'

// helper
const TD = ({children, style}) => <td style={ R.merge({ borderBottom: 'solid 1px #ddd', padding: '0.3em 0 0.3em 0' }, style) }>{children}</td>
const TH = ({children, width}) => <th style={ { textAlign: 'left', width: `${width}px`, fontWeight: 'bold', backgroundColor: '#f0f0f0', fontSize: '0.9em', padding: '0.5em 0' } }>{children}</th>

const Table = ({data}) => {
  const horizontal_keys = R.pipe(
      R.chain(x => x.data)
    , R.map(x => x.day_after_subscription)
    , R.uniq
    , R.sortBy(x => x)
  )(data)
  return <table style={ { width: '900px', backgroundColor: 'white', marginBottom: '2em', color: 'black', fontFamily: 'Osaka, CONSOLAS, monospace' } } cellSpacing="0" cellPadding="0">
    <thead>
      <tr>
        <TH></TH>
        <TH>Date</TH>
        <TH>Sales</TH>
        <TH>eCPA</TH>
        {
          horizontal_keys.map(k => <TH key={k}>{ k < 30 ? `Week ${k / 7}` : `Month ${Math.round(k / 30.5)}`}</TH>)
        }
      </tr>
    </thead>
    <tbody>{
      data.map((x, i) => {
        const ecpa = x.data[0].cost / x.data[0].sale_count
        return <tr key={i}>
          <TD>{timeFormat('%U')(new Date(x.day).valueOf())}</TD>
          <TD>{timeFormat('%Y-%m-%d')(new Date(x.day))}</TD>
          <TD>{d3.format(',')(x.data[0].sale_count)}</TD>
          <TD>{d3.format('0.1f')(ecpa)}</TD>
          {
            x.data.map((x, i) => <TD key={i} style={ { color: x.arpu > ecpa ? 'green' : '' } }>{d3.format('0.1f')(x.arpu)}</TD>)
          }
        </tr>
      })}
    </tbody>
  </table>
}


class Cohort extends React.Component {
  constructor(props : Props) {
    super(props)

    this.state = {}

    const {params} = props.match
    const {date_from, date_to, filter} = params
    get({url: `/api/v1/cohort/${date_from}/${date_to}/${filter}`, cache: "force-cache"}, {cache: "force-cache"})
    .then(res => this.setState({res}))

  }

  render() {
    const {params} = this.props.match
    if( !!this.state.res) {
      return <Table data={this.state.res} />
    } else {
      return <div>Loading ...</div>
    }
  }
}

export default connect(
    state => ({
        // data: filter_page_section_row_selector(state)
      all_countries: state.all_countries })
  , {
    }
)(Cohort)
