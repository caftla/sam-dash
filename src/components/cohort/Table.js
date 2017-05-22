const {format} = require('d3-format')
const {timeFormat} = require('d3-time-format')
import R from 'ramda'

import {TD, TH, TABLE} from '../plottables/table'

const Table = ({data}) => {
  const horizontal_keys = R.pipe(
      R.chain(x => x.data)
    , R.map(x => x.day_after_subscription)
    , R.uniq
    , R.sortBy(x => x)
  )(data)
  return <TABLE style={ { minWidth: '900px' } } cellSpacing="0" cellPadding="0">
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
          <TD>{format(',')(x.data[0].sale_count)}</TD>
          <TD style={ {width: '80px'} }>{format('0.1f')(ecpa)}</TD>
          {
            x.data.map((x, i) => <TD key={i} style={ { color: x.arpu > ecpa ? 'green' : '' } }>{format('0.2f')(x.arpu)}</TD>)
          }
        </tr>
      })}
    </tbody>
  </TABLE>
}

export default Table
