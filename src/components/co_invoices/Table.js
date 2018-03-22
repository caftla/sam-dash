import React from 'react'
import R from 'ramda'
import stylus from './Table.styl'
import type { FetchState } from '../../adts'
import { match, fetchState } from '../../adts'
import { debug } from 'util';
import { setTimeout } from 'timers'
import { get } from '../../helpers'
import { Submit } from '../Styled'

const d3 = require('d3-format')

export const ExportToExcel = ({ onClick }) => {
  return <div className="no-print" onClick={onClick} style={{cursor: 'pointer'}}>
    <i className="fa fa-file-excel-o" aria-hidden="true"></i>  Export to Excel</div>
}

export const DownloadPDF = ({ onClick, downloading_pdf }) => {
  return <div className="no-print" onClick={onClick} style={{cursor: 'pointer'}}>
    {downloading_pdf
      ? <i className="fa fa-circle-o-notch fa-spin-custom"></i>
      : <i className="fa fa-file-pdf-o" aria-hidden="true"></i> }
      &ensp;Download Co-Invoice</div>
}

const TH = ({ colSpan, text }) => <th colSpan={colSpan? colSpan : ''} style={{ textAlign: 'left', padding: '10px'}}>{text}</th>
const TD = ({ colSpan, text, className }) => <td className={className? className : ''} colSpan={colSpan? colSpan : ''} rowSpan={1} style={{ textAlign: 'left', padding: '10px' }}>{text}</td>


export const SummeryTable = ({ data, total_cpa, billing_address }) =>
  data.length
  ? <div>
      <table style={{borderCollapse: 'collapse', margin: '0 auto 0 auto' }}>
        <colgroup>
          <col span="6" width="110px" />
        </colgroup>
        <thead>
          <tr style={{backgroundColor: '#f3f3f3', border: '1px solid #f3f3f3'}}>
            <TH text={'Country'} />
            <TH text={'Sales'} />
            <TH text={'Repeat Sales'} />
            <TH text={'EPC'} />
            <TH text={'Total'} />
          </tr>
        </thead>
        <tbody>
          {data.map((record, index) => <tr 
            colSpan={3}      
            key={index} 
            record={record} 
            style={{border: '1px solid #f3f3f3'}}>
          {R.keys(record).map(keys =>
            <TD
              text={record[keys] 
              ? keys == 'epc'? d3.format('0.3f')(record[keys]) 
                : keys == 'total'? d3.format(',')(record[keys]) : record[keys]
              : record[keys]}

              className={keys}/>
          )}
          </tr>
          )}
        </tbody>
        <tfoot>
          <tr style={{backgroundColor: '#f3f3f3', border: '1px solid #f3f3f3'}}>
            <TH colSpan={4} text={'Total Earnings in USD'} />
            <TD text={d3.format(',')(total_cpa)} />
          </tr>
        </tfoot>
      </table>
      <div style={{textAlign: 'center' }}>
        <h3>Billing Address: { billing_address }</h3>
      </div>
    </div>
    : <div className="no-print" />


export const BreakdownTable = ({ data, total_cpa, billing_address }) =>
  data.length
  ? <div className='invoice'>
      <table style={{borderCollapse: 'collapse', margin: '0 auto 0 auto' }}>
        <colgroup>
          <col span="6" width="110px" />
        </colgroup>
        <thead>
          <tr style={{backgroundColor: '#f3f3f3', border: '1px solid #f3f3f3'}}>
            <TH text={'Country'} />
            <TH text={'Operator'} />
            <TH text={'Sales'} />
            <TH text={'CPA'} />
            <TH text={'Repeat Sales'} />
            <TH text={'Earnings'} />
          </tr>
        </thead>
        <tbody>
          {data.map((record, index) => <tr 
            colSpan={3}      
            key={index} 
            record={record} 
            style={{border: '1px solid #f3f3f3'}}>
          {R.keys(record).map(keys =>
            <TD
              text={record[keys] 
              ? keys == 'cpa'? d3.format('0.2f')(record[keys]) : keys == 'total'? d3.format(',')(record[keys]) : record[keys]
              : record[keys] }

              className={keys}/>
          )}
          </tr>
          )}
        </tbody>
        <tfoot>
          <tr style={{backgroundColor: '#f3f3f3', border: '1px solid #f3f3f3'}}>
            <TH colSpan={5} text={'Total Earnings in USD'} />
            <TD text={d3.format(',')(total_cpa)} />
          </tr>
        </tfoot>
      </table>
    </div>
    : <div className="no-print" />

