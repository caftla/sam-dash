// @flow

import React from 'react'
import { connect } from 'react-redux'
import { ThemeProvider } from 'styled-components'
import R from 'ramda'
import moment from 'moment'
import stylus from './index.styl'

import type { Maybe } from 'flow-static-land/lib/Maybe'
import type { QueryParams } from '../../my-types'

import { match } from '../../adts'
import type { FetchState } from '../../adts'
import { fromQueryString, sequence } from '../../helpers'
import * as maybe from 'flow-static-land/lib/Maybe'

import {
  fetch_all_affiliates , fetch_co_invoices, cleanup_fetch_co_invoices
} from '../../actions'

import { BreakdownTable, SummeryTable, LetterBody } from './Tables'
import { DownloadPDF } from './DownloadPDF'
import { flatten_data, get_apac_breakdown, get_eu_breakdown, get_summery, get_total_cpa } from './transformations'
import Controls from './Controls'

const theme = {
    flexDirection: 'row'
  , formSectionWidth: '260px'
  , formLabelWidth: '60px'
  , formLabelTextAlign: 'right'
  , filterFormSectionDisplay: 'flex'
  , filterFormSectionWidth: '600px'
  , elementHeight: '22px'
  , elementWidth: '200px'
  , fontSize: '1em'
  , formContainerMargin: '0'
  , formTitleFontSize: '1em'
  , flexAlignItems: 'flex-start'
  , submitAlignSelf: 'flex-end'
}

type Props = {
    match: { params: QueryParams }
  , history: any
  , data: FetchState<Array<any>>
  , params: QueryParams
  , fetch_co_invoices: (timezone: string, date_from : string, date_to : string, filter : string) => void
  , fetch_all_affiliates: (date_from: string, date_to: string) => void
  , all_affiliates: Maybe<Array<any>>
  , cleanup_fetch_co_invoices: () => void
  , set_params: (params: QueryParams) => void
}

const props_to_params = props => {
  const defaultDateFrom = moment().subtract(1, 'month').startOf('month').format('YYYY-MM-DD')
  const defaultDateTo   = moment().subtract(1, 'month').endOf('month').add(1, 'days').format('YYYY-MM-DD')
  const deafultTimezone = '+0'
  const { params } = props.match
  const query = fromQueryString(props.location.search)
  const mparams = R.merge(params, R.applySpec({
      date_from: p => p.date_from || defaultDateFrom
    , date_to: p => p.date_to || defaultDateTo
    , timezone: p => p.timezone || deafultTimezone
    , filter: p => p.filter || '-'
    , nocache: () => query.nocache == 'true' ? true : false
  })(params))
  return mparams
}

class Coinvoices extends React.Component {

  props: Props

  state: {
    downloading_pdf: boolean
  , name: string
  , email: string
  }

  constructor(props : any) {
    super(props)

    this.state = {
      name: ''
    , email: ''
    }

    const {params} = props.match
    const {timezone, date_from, date_to, nocache, filter} = params
  }

  componentDidMount() {
    const params = props_to_params(this.props)
    this.props.fetch_all_affiliates()
    const filter_params = R.pipe(
      R.split(',')
      , R.map(R.split('='))
      , R.fromPairs
    )(params.filter || '-')

    if (filter_params.affiliate_name) {     
      match({
        Nothing: () => this.props.fetch_co_invoices(params.timezone, params.date_from, params.date_to, params.filter, params.nocache)
      , Loading: () => void 9
      , Error: (error) => void 9
      , Loaded: (data) => void 9
      })(this.props.data)
    }
  }

  componentWillUpdate(nextProps : Props, b) {
    const params = props_to_params(nextProps)
    match({
      Nothing: () => {
        if (params.filter == '-') {
          void 9
        } else {
          nextProps.fetch_co_invoices(params.timezone, params.date_from, params.date_to, params.filter, params.nocache)
        }
      }
      , Loading: () => void 9
      , Error: (error) => void 9
      , Loaded: (data) => void 9
    })(nextProps.data)
  }

  setName(name){
    this.setState({ name })
  }

  setEmail(email){
    this.setState({ email })
  }
  // TODO: merge two cells (for grouping by country)
  // componentDidUpdate(){
  //   window.addEventListener('load', this.merge_cells())
  // }

  // merge_cells = () => {
  //   const cells = Array.from(document.querySelectorAll('td.country_code'))
  //   const get_rowspan = x => parseInt(cells[x].getAttribute('rowspan'))
  //   const plus_one = (x :number) => x + 2
  //   console.log(plus_one(get_rowspan(0)))
  //   let i
  //   for (i = 0; i < cells.length - 1; i++) {
  //     if (cells[i].innerHTML == cells[i + 1].innerHTML) {
  //       cells[i].setAttribute('rowspan', plus_one(get_rowspan(i))) 
  //       cells[i + 1].remove()
  //     } else {
  //       cells[i].setAttribute('rowspan', get_rowspan(i))
  //     }
  //   }
  // }

  // export_to_excel = (e) => {
  //   e.preventDefault()
  //   const workbook = XLSX.utils.table_to_book(document.querySelectorAll('.invoice'), {cellHTML:true})
  //   const wopts = { bookType:'xlsx', bookSST:false, type:'binary' };

  //   const wbout = XLSX.write(workbook,wopts);

  //   const s2ab = (s) => {
  //     const buf = new ArrayBuffer(s.length);
  //     const view = new Uint8Array(buf);
  //     for (var i=0; i!=s.length; ++i) view[i] = s.charCodeAt(i) & 0xFF;
  //     return buf;
  //   }

  //   /* the saveAs call downloads a file on the local machine */
  //   saveAs(new Blob([s2ab(wbout)],{type:""}), `${this.props.match.params.filter}.xlsx`)
  // }

  render() {
    const params = props_to_params(this.props)
    const data_component = match({
      Nothing: () => <div>Please Select Affiliate Name</div>
    , Loading: () => <div>Loading Affiliate Data...</div>
    , Error: (error) => <div>Error {error}</div>
    , Loaded: (data) => {
      const flat_data = flatten_data(data)
      const eu_summery = get_summery(flat_data, 'Asia/Kuala_Lumpur')
      const apac_summery = get_summery(flat_data, 'Europe/Amsterdam')
      const apac_breakdown = get_apac_breakdown(flat_data)
      const eu_breakdown = get_eu_breakdown(flat_data)
      return (
        <div>
        { flat_data.length == 0 
          ? <div>No data was found for this affiliate</div> 
          : <div>
            {/* <ExportToExcel onClick={this.export_to_excel} /> */}
            <DownloadPDF
              filter={this.props.match.params.filter}
              date_from={this.props.match.params.date_from}
              date_to={this.props.match.params.date_to}
              set_name={name => this.setName(name)}
              set_email={email => this.setEmail(email)}
            />

            <div className="table-container">
              <SummeryTable
                data={eu_summery}
                total_cpa={get_total_cpa(eu_summery)}
                region={'EU'}
              />

              <SummeryTable
                data={apac_summery}
                total_cpa={get_total_cpa(apac_summery)}
                region={'Non-EU'}
              />

              <LetterBody name={this.state.name} email={this.state.email} />

              <BreakdownTable
                data={eu_breakdown}
                total_cpa={get_total_cpa(eu_breakdown)}
                region='EU'
              />

              <BreakdownTable
                data={apac_breakdown}
                total_cpa={get_total_cpa(apac_breakdown)}
                region={'Non-EU'}
              />
            </div>
          </div>}
        </div>)
    }
    })(this.props.data)
    return <div className="main-bottom">
      <ThemeProvider theme={theme}>
        {
          maybe.maybe(
              _ => {
                return <div className="no-print">Loading affiliates...</div>
              }
            , ([all_affiliates]) => _ => {
                return <div id="sidebar" className="visible">
                  <div id="filters">
                    <Controls
                      className="main-left show"
                      params={ params }
                      affiliates={ all_affiliates }
                      history={ this.props.history }
                    />
                  </div>
                </div>
              }
            , sequence([this.props.all_affiliates])
          )()
        }
      </ThemeProvider>
      <div id="container" className="default print_styles">
        { data_component }
      </div>
    </div>
  }
}

export default connect(
  state => ({
    all_affiliates: state.all_affiliates
    , data: state.co_invoices
    })
  , {
      fetch_all_affiliates
      , fetch_co_invoices
      , cleanup_fetch_co_invoices
  }
)(Coinvoices)
