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


export const ExportToExcel = ({ k, onClick }) => {
  return <div id='export-to-excel' onClick={onClick}>🗒 Export to Excel</div>
}

class Subscription extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      transactions: fetchState.Nothing()
    }
    this.export_to_excel = this.export_to_excel.bind(this)
  }

  fetch_transactions = (e, rockman_id) => {
    e.preventDefault()
    const api_root = process.env.api_root || '' // in production api_root is the same as the client server

    this.setState({ transactions: fetchState.Loading() })
    const { timezone, date_from, date_to, filter} = this.props
    get({ url: `${api_root}/api/v1/user_transactions/${timezone}/${date_from}/${date_to}/rockman_id=${rockman_id}/-/-/-`, nocache: true })
      .then(ts => this.setState({ transactions: fetchState.Loaded(ts) }))
      .catch(e => this.setState({ transactions: fetchState.Error(e) }))
  }

  export_to_excel = (e, k) => {
    e.preventDefault()
    const full_table = document.getElementById(`table-${k}`)
    const trans_row = full_table.childNodes[1]
    full_table.removeChild(full_table.childNodes[1])
    const workbook = XLSX.utils.table_to_book(document.getElementById(`table-${k}`), { cellHTML: true, sheet: 'Subscription Info' })
    full_table.insertBefore(trans_row, full_table.childNodes[1])

    const trans_tables = document.getElementById(`trans-tables-${k}`)

    if (trans_tables) {
      const worksheet = XLSX.utils.table_to_sheet(trans_tables)
      workbook.SheetNames.push('Transactions')
      workbook.Sheets['Transactions'] = worksheet
    }
    const wopts = { bookType:'xlsx', bookSST: false, type:'binary' };
    const wbout = XLSX.write(workbook, wopts)
    const s2ab = (s) => {
      const buf = new ArrayBuffer(s.length)
      const view = new Uint8Array(buf)
      for (var i=0; i!=s.length; ++i) view[i] = s.charCodeAt(i) & 0xFF
      return buf
    }
    /* the saveAs call downloads a file on the local machine */
    saveAs(new Blob([s2ab(wbout)],{type:""}), `${this.props.date_from}-${this.props.date_to}-${this.props.filter}.xlsx`)
  }
  render() {
    const { record, id, timezone, date_from, date_to, filter, onclick} = this.props
    const transactions_component = match({
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
            ? <div>No transactions were found for this service, try extending date range.</div> 
            : <div flat_data={flat_data}>
              <a style={{ color: 'blue', cursor: 'pointer' }} onClick={ () => this.setState({ transactions: fetchState.Nothing() })} >
                Click here to hide transactions..
              </a>
                <table id={`trans-tables-${id}`} className={'trans-tables'}>
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
            </div>
          }
          </div>
        )
      }
    })(this.state.transactions)

    return <div>
      <ExportToExcel onClick={e => this.export_to_excel(e, this.props.id)} />
      <table id={`table-${id}`} className={'subscription-table'} style={{ border: '0.5pt solid #f3f3f3' }}>
        <colgroup>
          <col span="1" style={{width: '240px' }}/>
        </colgroup>
        <tr id="transaction-row">
          <th>
            TRANSACTIONS
          </th>
          <td>
            { transactions_component }
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
              </tr>
            )
          }
      </table>
    </div>
  }
}

export const TableWithData = ({ data, timezone, date_from, date_to, filter }) => <div>
  <p style={{ padding: '8px' }}>Number of Subscriptions : {data.length}</p>
  {
    data.map((record, index) => <Subscription
      key={index} 
      id={index + 1}
      record={record}
      timezone={timezone}
      date_from={date_from}
      date_to={date_to}
      filter={filter}
    />)
  }
</div>
