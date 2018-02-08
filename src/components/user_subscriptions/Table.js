import React from 'react'
import R from 'ramda'
import stylus from './Table.styl'
import type { FetchState } from '../../adts'
import { match, fetchState } from '../../adts'
import { debug } from 'util';
import { setTimeout } from 'timers';
import { get } from '../../helpers'
import { Submit } from '../Styled'
// const fetchTransactions = rockman_id => new Promise((resolve, reject) =>
//   // fake!
//   setTimeout(() => resolve(R.range(0, 5).map(i => `Transaction ${i}`)), 2000)
// )


export const ExportToExcel = ({ onClick }) => {
  return <div id='export-to-excel' onClick={onClick}>🗒 Export to Excel</div>
}

class Subscription extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      transactions: fetchState.Nothing()
    }
    // this.fetch_transactions = this.fetch_transactions(this)
  }

  fetch_transactions = (e, rockman_id) => {
    console.log(e)
    e.preventDefault()
    const api_root = process.env.api_root || '' // in production api_root is the same as the client server

    this.setState({ transactions: fetchState.Loading() })
    const { timezone, date_from, date_to, filter} = this.props
    get({ url: `${api_root}/api/v1/user_transactions/${timezone}/${date_from}/${date_to}/rockman_id=${rockman_id}/-/-/-` })
      .then(ts => this.setState({ transactions: fetchState.Loaded(ts) }))
      .catch(e => this.setState({ transactions: fetchState.Error(e) }))
  }
  render() {
    const { record, timezone, date_from, date_to, filter} = this.props
    return <div>
      <table id='table' style={{ border: '1 solid grey' }}>
        <colgroup>
          <col span="1" style={{width: '240px' }}/>
        </colgroup>
        <colgroup>
          <col span="1" />
        </colgroup>
        <tr>
            <th>
              TRANSACTIONS
            </th>
            <td>
            {
              match({
                Nothing: () => <a style={{ color: 'blue', cursor: 'pointer' }} onClick={e => this.fetch_transactions(e, record['rockman_id'])}>Click here to view transactions for this service</a>
                , Loading: () => 'LOADING...'
                , Error: (error) => console.log(error)
                , Loaded: (transactions) => {
                  const flat_data = R.pipe(
                    R.chain(([_, transactions]) => transactions)
                  , R.chain(([_, transactions]) => transactions)
                  )(transactions)
                  return (
                    <div>
                    {
                      flat_data.length == 0 
                      ? <div>No data was found, try adding/removing country code and extending the date range.</div> 
                      : <div flat_data={flat_data}>
                          <table id="trans-tables">
                          {flat_data.map((tr, index) => <div 
                            key={index} 
                            className={ 
                              tr.dnstatus == 'Delivered'? 'delivered'
                                : tr.dnstatus == 'Pending' ? 'pending'
                                : tr.dnstatus == 'Failed' ? 'failed'
                              : ''
                            }
                            tr={tr}>
                          
                          { R.keys(tr).map((keys) =>
                            <tr>
                              <th>
                                {keys.toUpperCase().replace(/_/g, ' ')}
                              </th>
                              {<td>
                                {tr[keys] ? tr[keys] : '-'}
                              </td> }
                            </tr>)}
                          </div>)
                            }
                            </table>
                      </div>}
                    </div>
                  )                  
                }
              })(this.state.transactions)
          }
            </td>
          </tr>
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
    </div>
  }
}

export const TableWithData = ({ data, timezone, date_from, date_to, filter }) => <div>
  <p style={{ padding: '8px' }}>Number of Subscriptions : {data.length}</p>
  {
    data.map((record, index) => <Subscription key={index} record={record} timezone={timezone} date_from={date_from} date_to={date_to} filter={filter} />)
  }
</div>