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

import { BreakdownTable, SummaryTable, LetterBody } from './Tables'
import { DownloadPDF } from './DownloadPDF'
import { flatten_data, get_summary, get_total_cpa, get_additional_costs, get_total_additional_cpa, get_breakdown } from './transformations'
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
    , filter: p => !!p.filter? p.filter.replace(/\t/g, '%09') : '-'
    , nocache: () => query.nocache == 'true' ? true : false
  })(params))
  return mparams
}

const filter_params_from_filter_string = (filter) => R.pipe(
  R.split(',')
  , R.map(R.split('='))
  , R.fromPairs
)(filter || '-')

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
    const filter_params = filter_params_from_filter_string(params.filter)

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
  
  render() {
    const params = props_to_params(this.props)
    const filter_params = filter_params_from_filter_string(params.filter)
    console.log(filter_params.affiliate_name)
    const data_component = match({
      Nothing: () => <div>Please Select Affiliate Name</div>
    , Loading: () => <div>Loading Affiliate Data...</div>
    , Error: (error) => <div>Error {error}</div>
    , Loaded: (data) => {
      const flat_data = flatten_data(data)
      const eu_summary = get_summary(flat_data, 'Asia/Kuala_Lumpur')
      const apac_summary = get_summary(flat_data, 'Europe/Amsterdam')
      const apac_additional = get_additional_costs(flat_data, 'Europe/Amsterdam')
      const eu_additional = get_additional_costs(flat_data, 'Asia/Kuala_Lumpur')
      const apac_breakdown = get_breakdown(flat_data, 'Europe/Amsterdam')
      const eu_breakdown = get_breakdown(flat_data, 'Asia/Kuala_Lumpur')
      const all_summary = get_summary(flat_data, '-')
      const all_additional_cost = get_additional_costs(flat_data, '-')
      const all_breakdown = get_breakdown(flat_data, '-')
      return (
        <div>
        { flat_data.length == 0 
          ? <div>No data was found for this affiliate</div> 
          : filter_params.affiliate_name.includes('Sam Media Affise') //affise invoice goes to LTD entity..
            ? <div>
                <DownloadPDF
                filter={this.props.match.params.filter}
                date_from={this.props.match.params.date_from}
                date_to={this.props.match.params.date_to}
                set_name={name => this.setName(name)}
                set_email={email => this.setEmail(email)}
                />

                <div className="table-container">
                  <SummaryTable
                    data={all_summary}
                    total_cpa={get_total_cpa(all_summary)}
                    additional_costs={all_additional_cost}
                    total_additional_cpa={get_total_additional_cpa(all_additional_cost)}
                    region={'Sam Media LTD'}
                  />

                  <LetterBody name={this.state.name} email={this.state.email} />

                  <BreakdownTable
                    data={all_breakdown}
                    total_cpa={get_total_cpa(eu_breakdown)}
                    region='Sam Media LTD'
                  />
                </div>
              </div>
            
            : <div>
            <DownloadPDF
              filter={this.props.match.params.filter}
              date_from={this.props.match.params.date_from}
              date_to={this.props.match.params.date_to}
              set_name={name => this.setName(name)}
              set_email={email => this.setEmail(email)}
            />

            <div className="table-container">
              <SummaryTable
                data={eu_summary}
                total_cpa={get_total_cpa(eu_summary)}
                additional_costs={eu_additional}
                total_additional_cpa={get_total_additional_cpa(eu_additional)}
                region={'Sam Media BV'}
              />

              <SummaryTable
                data={apac_summary}
                total_cpa={get_total_cpa(apac_summary)}
                additional_costs={apac_additional}
                total_additional_cpa={get_total_additional_cpa(apac_additional)}
                region={'Sam Media LTD'}
              />

              <LetterBody name={this.state.name} email={this.state.email} />

              <BreakdownTable
                data={eu_breakdown}
                total_cpa={get_total_cpa(eu_breakdown)}
                region='Sam Media BV'
              />

              <BreakdownTable
                data={apac_breakdown}
                total_cpa={get_total_cpa(apac_breakdown)}
                region={'Sam Media LTD'}
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
