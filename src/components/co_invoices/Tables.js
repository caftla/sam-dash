import React from 'react'
import R from 'ramda'

const d3 = require('d3-format')

const TH = ({ colSpan, text }) => <th colSpan={colSpan? colSpan : ''} style={{ textAlign: 'left', padding: '10px'}}>{text}</th>
const TD = ({ colSpan, text, className }) => <td className={className? className : ''} colSpan={colSpan? colSpan : ''} rowSpan={1} style={{ textAlign: 'left', padding: '10px' }}>{text}</td>

export const SummeryTable = ({ data, total_cpa, region }) =>
  data.length
  ? <div>
      <table style={{borderCollapse: 'collapse', margin: '20px auto 0 auto', width: '80%', fontSize: '14px'}}>
        <colgroup>
          <col span="6" width="110px" />
        </colgroup>
        <thead>
          <tr style={{backgroundColor: '#f3f3f3', border: '1px solid #f3f3f3'}}>
            <TH colSpan={6} text={`${region} Sales Summery`} />
          </tr>
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
      <div className="print-only" style={{ textAlign: 'left', marginLeft: '10%', fontSize: '12px' }}>
        { region == 'EU'
            ? <div>
              <p>For EU sales, kindly invoice the amount of
                <span className="bolder-text">
                  &ensp;{d3.format(',')(total_cpa)}&ensp;USD&ensp;
                </span>
              to the following address:</p>
              <address>
                Sam Media B.V. <br />
                Van Diemenstraat 140 <br />
                1013 CN Amsterdam <br />
              </address>
            </div>
            : <div>
              <p>For non-EU sales, kindly invoice the amount of
                <span className="bolder-text">
                &ensp;{d3.format(',')(total_cpa)}&ensp;USD&ensp;
                </span>
                to the following address:</p>
              <address>
                Sam Media Ltd <br />
                1010, 10/F, Miramar Tower <br />
                132 Nathan Road <br />
                Tsim Sha Tsui, Kowloon <br />
                Hong Kong <br />
              </address>
            </div>
            }
      </div>
    </div>
    : <div className="no-print" />


export const BreakdownTable = ({ data, total_cpa, region }) =>
  data.length
  ? <div className='invoice'>
      <table style={{borderCollapse: 'collapse', margin: '20px auto 0 auto', width: '80%', fontSize: '14px' }}>
        <colgroup>
          <col span="6" width="110px" />
        </colgroup>
        <thead>
          <tr style={{backgroundColor: '#f3f3f3', border: '1px solid #f3f3f3'}}>
            <TH colSpan={6} text={`${region} Sales Breakdown`} />
          </tr>
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

export const LetterBody = ({ name, email }) =>
  <div className="print-only page-break" style={{ textAlign: 'left', margin: '20px 0 0 10%', fontSize: '12px' }}>
    Notes: <br />
    - Please note that timezone for the stats in this report is UTC+0. <br />
    - Please note that according to Sam Media financial policy a payment is made once 500USD threshold is reached. <br />
    - Please prepare invoices to the two billing addresses indicated above accordingly. <br />
    - Kindly email the invoice to <span className="bolder-text"> ###finance email### </span>
    and cc to <span className="bolder-text">{ email }</span>.<br /><br /><br />
  </div>