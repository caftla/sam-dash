import React from 'react'
import R from 'ramda'

const d3 = require('d3-format')

const TH = ({ colSpan, text }) => <th colSpan={colSpan? colSpan : ''} style={{ textAlign: 'left', padding: '10px'}}>{text}</th>
const TD = ({ colSpan, text, className }) => <td className={className? className : ''} colSpan={colSpan? colSpan : ''} rowSpan={1} style={{ textAlign: 'left', padding: '10px' }}>{text}</td>
const finance_email = process.env.finance_email

export const SummaryTable = ({ data, total_cpa, additional_costs, total_additional_cpa, region }) =>
  data.length
  ? <div>
      <table className='tables'>
        <colgroup>
          <col span="6" width="110px" />
        </colgroup>
        <thead>
          <tr style={{backgroundColor: '#f3f3f3', border: '1px solid #f3f3f3'}}>
            <TH colSpan={6} text={`${region} Sales Summary`} />
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
              ? keys == 'epc'? record[keys] == Infinity ? '-' : d3.format('0.4f')(record[keys]) 
                : keys == 'total'? '$' + d3.format(',.2f')(record[keys]) : record[keys]
              : record[keys]}

              className={keys}/>
          )}
          </tr>
          )}
        </tbody>

          <tr style={{backgroundColor: '#f3f3f3', border: '1px solid #f3f3f3'}}>
            <TH colSpan={4} text={'Subtotal'} />
            <TD text={'$' + d3.format(',.2f')(total_cpa)} />
          </tr>

          <tr>
            <td colSpan={3}>Compensations/Penalties</td>
            <td colSpan={2}>
              <table>
                <tr style={{backgroundColor: '#f3f3f3', border: '1px solid #f3f3f3'}}>
                  <TH text={'Country'} />
                  <TH text={'CPA'} />
                  <TH text={'Sales'} />
                </tr>
                {!!additional_costs ? additional_costs.map((additional_cost, index) =>
                    <tr>
                      <TD text={(additional_cost.country)} />            
                      <TD text={(additional_cost.additional_pixels_cpa)} />
                      <TD text={(additional_cost.additional_pixels)} />
                    </tr>
                  ) : ''}
                  <tr>
                    <TH colSpan={2} text={'Total'} />
                    <TD text={'$' + d3.format(',.2f')(total_additional_cpa)} />
                  </tr>
                </table>
            </td>
          </tr>

        <tfoot>
          <tr style={{backgroundColor: '#f3f3f3', border: '1px solid #f3f3f3'}}>
            <TH colSpan={4} text={'Grand Total'} />
            <TD text={'$' + d3.format(',.2f')(parseInt(total_cpa) + parseInt(total_additional_cpa))} />
          </tr>
        </tfoot>
      </table>
      <div className="print-only" style={{ textAlign: 'left', marginLeft: '10%', fontSize: '12px' }}>
        { region == 'EU'
            ? <div>
              <p>For Sam Media B.V. sales, kindly invoice the amount of
                <span className="bolder-text">
                  &ensp;{'$' + d3.format(',.2f')(parseInt(total_cpa) + parseInt(total_additional_cpa))}&ensp;
                </span>
              to the following address:</p>
              <address>
                Sam Media B.V. <br />
                Van Diemenstraat 140 <br />
                1013 CN Amsterdam <br />
              </address>
            </div>
            : <div>
              <p>For Sam Media LTD sales, kindly invoice the amount of
                <span className="bolder-text">
                &ensp;{'$' + d3.format(',.2f')(parseInt(total_cpa) + parseInt(total_additional_cpa))}&ensp;
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
      <table className='tables'>
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
              ? keys == 'cpa'? d3.format('0.2f')(record[keys]) : keys == 'total'? '$' + d3.format(',.2f')(record[keys]) : record[keys]
              : record[keys] }

              className={keys}/>
          )}
          </tr>
          )}
        </tbody>
        <tfoot>
          <tr style={{backgroundColor: '#f3f3f3', border: '1px solid #f3f3f3'}}>
            <TH colSpan={4} text={'Total Earnings in USD'} />
            <TD text={'$' + d3.format(',.2f')(total_cpa)} />
          </tr>
        </tfoot>
      </table>
    </div>
    : <div className="no-print" />

export const LetterBody = ({ name, email }) =>
  <div className="print-only page-break" style={{ textAlign: 'left', margin: '20px 0 0 10%', fontSize: '12px' }}>
    Notes: <br />
    - Please note that timezone for the stats in this report is UTC+0. <br />
    - Please note that according to Sam Media financial policy a payment is made once $500 threshold is reached. <br />
    - Please prepare invoices to the two billing addresses indicated above accordingly. <br />
    - Kindly email the invoice to <span className="bolder-text"> { finance_email } </span>
    and cc <span className="bolder-text">{ email }</span>.<br /><br /><br />
  </div>