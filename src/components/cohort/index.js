// @flow

// cohort

import React from 'react'
import { connect } from 'react-redux'
import { ThemeProvider } from 'styled-components'
import R from 'ramda'

//TODO: temp
import { get } from '../../helpers'

import type { QueryParams } from 'my-types'
import { fetchState, match } from '../../adts'
import type { FetchState } from '../../adts'
import { sequence } from '../../helpers'
import * as maybe from 'flow-static-land/lib/Maybe'
import type { Maybe } from 'flow-static-land/lib/Maybe'


import {
    fetch_all_countries , set_params
  , fetch_all_affiliates
  , fetch_cohort, cleanup_fetch_cohort
} from '../../actions'


import Table from './Table'
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
  , fetch_cohort: (date_from : string, date_to : string, filter : string) => void
  , fetch_all_countries: (date_from: string, date_to: string) => void
  , all_countries: Maybe<Array<any>>
  , cleanup_fetch_cohort: () => void
  , set_params: (params: QueryParams) => void
}


const props_to_params = props => {
  const {timeFormat} = require('d3-time-format')
  const formatDate = timeFormat('%Y-%m-%d')
  const defaultDateFrom = formatDate(new Date(new Date().valueOf() - 62 * 24 * 3600 * 1000))
  const defaultDateTo   = formatDate(new Date(new Date().valueOf() + 1 * 24 * 3600 * 1000))
  const {params} = props.match
  const { format : d3Format } = require('d3-format')
  const formatTimezone = d3Format("+.1f")
  // const query = fromQueryString(props.location.search)
  const mparams = R.merge(params, R.applySpec({
      date_from: p => p.date_from || defaultDateFrom
    , date_to: p => p.date_to || defaultDateTo
    , filter: p => p.filter || '-'
  })(params))
  return mparams
}

class Cohort extends React.Component {

  props: Props

  state: {
    res: FetchState<Array<any>>
  }

  constructor(props : any) {
    super(props)

    this.state = {
      res: fetchState.Nothing()
    }

    const {params} = props.match
    const {date_from, date_to, filter} = params
    // get({url: `/api/v1/cohort/${date_from}/${date_to}/${filter}`, cache: "force-cache"}, {cache: "force-cache"})
    // .then(res => this.setState({res : fetchState.Loaded(res)}))

  }

  componentDidMount() {
    const params = props_to_params(this.props)
    this.props.fetch_all_affiliates()
    this.props.fetch_all_countries(params.date_from, params.date_to)
  }


  componentWillUpdate(nextProps : Props, b) {
    const params = props_to_params(nextProps)
    const current_params = props_to_params(this.props)

    match({
        Nothing: () => nextProps.fetch_cohort(params.date_from, params.date_to, params.filter)
      , Loading: () => void 9
      , Error: (error) => void 9
      , Loaded: (data) => void 9
    })(nextProps.data)

    if(current_params.date_from != params.date_from || current_params.date_to != params.date_to) {
      nextProps.fetch_all_countries(params.date_from, params.date_to)
    }
  }

  render() {
    const params = props_to_params(this.props)
    const data_component = match({
        Nothing: () => <div>Nothing</div>
      , Loading: () => <div>Loading...</div>
      , Error: (error) => <div>Error</div>
      , Loaded: (data) => {
          return <Table data={data} />
        }
    })(this.props.data)

    return <div className="main-bottom">
      <ThemeProvider theme={theme}>
        {
          maybe.maybe(
              _ => {
                return <div>Loading countries and affiliates...</div>
              }
            , ([all_countries, all_affiliates]) => _ => {
                return <Controls
                  className="main-left show"
                  params={ params }
                  countries={ all_countries }
                  affiliates={ all_affiliates }
                  history={ this.props.history }
                />
              }
            , sequence([this.props.all_countries, this.props.all_affiliates])
          )()
        }
      </ThemeProvider>
      <div className="main-right expand">
        { data_component }
      </div>
    </div>
  }
}

export default connect(
    state => ({
        all_countries: state.all_countries
      , all_affiliates: state.all_affiliates
      , data: state.cohort
    })
  , {
        fetch_all_countries, set_params
      , fetch_all_affiliates
      , fetch_cohort, cleanup_fetch_cohort
    }
)(Cohort)
