import React from 'react'
import R from 'ramda'
import stylus from './Table.styl'
import type { FetchState } from '../../adts'
import { match, fetchState } from '../../adts'
import { debug } from 'util';
import { setTimeout } from 'timers';

const fetchTransactions = rockman_id => new Promise((resolve, reject) =>
  // fake!
  setTimeout(() => resolve(R.range(0, 5).map(i => `Transaction ${i}`)), 2000)
)

export const ExportToExcel = ({ onClick }) => {
  return <div id='export-to-excel' onClick={onClick}>🗒 Export to Excel</div>
}

class Subscription extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      transactions: fetchState.Nothing()
    }
  }
  render() {
    const { record } = this.props
    return <div>
      <table id='table'>
        <tr>
          <th>
            STATUS
          </th>
          <td>
            {record.optout ? 'INACTIVE' : 'ACTIVE'}
          </td>
        </tr>
        {R.keys(record).map((keys) =>
          <tr>
            <th>
              {keys.toUpperCase().replace(/_/g, ' ')}
            </th>
            <td>
              {record[keys] ? record[keys] : '-'}
            </td>
          </tr>)
        }
      </table>
      {
        match({
          Nothing: () => <a style={{ color: 'blue', textDecoration: 'underline' }} onClick={() => {
            this.setState({ transactions: fetchState.Loading() })
            fetchTransactions(record['rockman_id'])
              .then(ts => this.setState({ transactions: fetchState.Loaded(ts) }))
              .catch(e => this.setState({ transactions: fetchState.Error(e) }))
          }}>Fetch data for {record['rockman_id']}</a>
          , Loading: () => 'LOADING...'
          , Error: (error) => 'ERROR'
          , Loaded: (transactions) => transactions.map((t, i) => <div key={i}>{t}</div>)
        })(this.state.transactions)
      }
    </div>
  }
}

export const TableWithData = ({ data }) => <div>
  <p style={{ padding: '8px' }}>Number of Subscriptions : {data.length}</p>
  {
    data.map((record, index) => <Subscription key={index} record={record} />)
  }
</div>