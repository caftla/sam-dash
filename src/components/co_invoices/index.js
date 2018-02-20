// @flow

import React from 'react'
import { connect } from 'react-redux'
import { ThemeProvider } from 'styled-components'
import R from 'ramda'

import type { Maybe } from 'flow-static-land/lib/Maybe'
import type { QueryParams } from 'my-types'

import { match } from '../../adts'
import type { FetchState } from '../../adts'
import { sequence } from '../../helpers'
import * as maybe from 'flow-static-land/lib/Maybe'

import {
    fetch_all_countries , fetch_user_subscriptions, cleanup_fetch_user_subscriptions
} from '../../actions'

import { ExportToExcel, TableWithData } from './Table'
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
  , fetch_user_subscriptions: (timezone: string, date_from : string, date_to : string, filter : string) => void
  , fetch_all_countries: (date_from: string, date_to: string) => void
  , all_countries: Maybe<Array<any>>
  , cleanup_fetch_user_subscriptions: () => void
  , set_params: (params: QueryParams) => void
}

const props_to_params = props => {
  const {timeFormat} = require('d3-time-format')
  const formatDate = timeFormat('%Y-%m-%d')
  const defaultDateFrom = formatDate(new Date(new Date().valueOf() - 62 * 24 * 3600 * 1000))
  const defaultDateTo   = formatDate(new Date(new Date().valueOf() + 1 * 24 * 3600 * 1000))
  const deafultTimezone = '+8'
  const {params} = props.match
  const { format : d3Format } = require('d3-format')
  const formatTimezone = d3Format("+.1f")
  // const query = fromQueryString(props.location.search)
  const mparams = R.merge(params, R.applySpec({
      date_from: p => p.date_from || defaultDateFrom
    , date_to: p => p.date_to || defaultDateTo
    , timezone: p => p.timezone || deafultTimezone
    , filter: p => p.filter || '-'
    , nocache: p => p.nocache == 'true' ? true : false
  })(params))
  return mparams
}

class Coinvoices extends React.Component {

  props: Props

  state: {
    res: FetchState<Array<any>>
  }

  constructor(props : any) {
    super(props)

    // this.state = {
    //   res: fetchState.Nothing()
    // }

    const {params} = props.match
    const {timezone, date_from, date_to, nocache, filter} = params
    this.export_to_excel = this.export_to_excel.bind(this)
  }

  componentDidMount() {
    const params = props_to_params(this.props)
    this.props.fetch_all_countries(params.date_from, params.date_to)
    const filter_params = R.pipe(
      R.split(',')
      , R.map(R.split('='))
      , R.fromPairs
    )(params.filter || '-')
    
    if (filter_params.msisdn) {     
      match({
        Nothing: () => this.props.fetch_user_subscriptions(params.timezone, params.date_from, params.date_to, params.filter, params.nocache)
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
          nextProps.fetch_user_subscriptions(params.timezone, params.date_from, params.date_to, params.filter, params.nocache)
        }
      }
      , Loading: () => void 9
      , Error: (error) => void 9
      , Loaded: (data) => void 9
    })(nextProps.data)
  }

  export_to_excel = (e) => {
    e.preventDefault()
    const workbook = XLSX.utils.table_to_book(document.getElementById('table'), {cellHTML:true})
    const wopts = { bookType:'xlsx', bookSST:false, type:'binary' };
  
    const wbout = XLSX.write(workbook,wopts);
  
    const s2ab = (s) => {
      const buf = new ArrayBuffer(s.length);
      const view = new Uint8Array(buf);
      for (var i=0; i!=s.length; ++i) view[i] = s.charCodeAt(i) & 0xFF;
      return buf;
    }
  
    /* the saveAs call downloads a file on the local machine */
    saveAs(new Blob([s2ab(wbout)],{type:""}), `${this.props.match.params.filter}.xlsx`)
  }


  render() {
    const params = props_to_params(this.props)
    const data_component = match({
      Nothing: () => <div>Please Enter MSISDN</div>
    , Loading: () => <div>Loading Subscription Data...</div>
    , Error: (error) => <div>Error</div>
    , Loaded: (data) => {
      const flat_data = R.pipe(
        R.chain(([_, data]) => data)
      , R.chain(([_, data]) => data)
      )(data)
      return (
        <div>
          { data.length == 0 
            ? <div>No data was found, try adding/removing country code and extending the date range.</div> 
            : <div>
              <ExportToExcel onClick={e => this.export_to_excel(e)} />
              <TableWithData data={flat_data} timezone={params.timezone} date_from={params.date_from} date_to={params.date_to} filter={params.filter} />
            </div>}
        </div>)
    }
    })(this.props.data)
    return <div className="main-bottom">
      <ThemeProvider theme={theme}>
        {
          maybe.maybe(
              _ => {
                return <div>Loading countries...</div>
              }
            , ([all_countries]) => _ => {
                return <div id="sidebar" className="visible">
                  <div id="filters">
                    <Controls
                      className="main-left show"
                      params={ params }
                      countries={ all_countries }
                      history={ this.props.history }
                    />
                  </div>
                </div>
              }
            , sequence([this.props.all_countries])
          )()
        }
      </ThemeProvider>
      <div id="container" className="default">
        { data_component }
      </div>
    </div>
  }
}

export default connect(
    state => ({
        all_countries: state.all_countries
      , data: state.user_subscriptions
      // , controls: state.controls

    })
  , {
      fetch_all_countries
      , fetch_user_subscriptions
      , cleanup_fetch_user_subscriptions
  }
)(Coinvoices)
