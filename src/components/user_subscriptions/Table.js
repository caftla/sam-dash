import React from 'react'
import R from 'ramda'
import stylus from './Table.styl'

export const ExportToExcel = ({onClick}) => {
  return <div id='export-to-excel' onClick={onClick}>🗒 Export to Excel</div>
}

export const TableWithData = ({data}) => {
  return (<div>
            <p style={{ padding: '8px'}}>Number of Subscriptions : { data.length }</p>
            { data.map((records, index) => (<div key={index}>
              <table id='table'>
                <tr>
                  <th>
                    STATUS
                  </th>
                  <td>
                    { records.optout?  'INACTIVE' : 'ACTIVE' }
                  </td>
                </tr>
                { R.keys(records).map((keys) =>
                  <tr>
                    <th>
                      {keys.toUpperCase().replace(/_/g, ' ')}
                    </th>
                    <td>
                      {records[keys] ? records[keys] : '-'}
                    </td>
                  </tr>)
                    }
              </table>
            </div>))}
  </div>)
}
