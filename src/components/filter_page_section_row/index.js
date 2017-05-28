// @flow

import React from 'react'
import { connect } from 'react-redux'
import { ThemeProvider } from 'styled-components'

import * as maybe from 'flow-static-land/lib/Maybe'
import type { Maybe } from 'flow-static-land/lib/Maybe'

import {
    fetch_all_countries
  , fetch_all_affiliates
  , fetch_filter_page_section_row, cleanup_fetch_filter_page_section_row, sort_row_filter_page_section_row
  , set_params } from '../../actions'
import type { QueryParams } from 'my-types'
import type { FetchState } from '../../adts'
import { match, fetchState } from '../../adts'

import Tabs from './Tabs'
import Controls from './Controls'

import filter_page_section_row_selector from '../../selectors/filter_page_section_row.js'
import affiliates_mapping_selector from '../../selectors/affiliates_mapping.js'
import { fromQueryString } from '../../helpers'

const { format : d3Format } = require('d3-format')
const formatTimezone = d3Format("+.1f")


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
  , formSectionButtonsFlexDirection: 'column'
  , checkBoxDivTransform: ' '
}

type Props = {
    match: { params: QueryParams }
  , history: any
  , data: FetchState<Array<any>>
  , params: QueryParams
  , fetch_filter_page_section_row: (date_from : string, date_to : string, filter : string, page : string, section : string, row : string) => void
  , fetch_all_countries: (date_from: string, date_to: string) => void
  , all_countries: Maybe<Array<any>>
  , fetch_all_affiliates: () => void
  , all_affiliates: Maybe<Array<any>>
  , cleanup_fetch_filter_page_section_row: () => void
  , sort_row_filter_page_section_row: (field: string, order: number) => void
  , sort: { field: string, order: number }
  , set_params: (params: QueryParams) => void
}

const props_to_params = props => {
    const {params} = props.match
    params.timezone = parseFloat(params.timezone)
    const query = fromQueryString(props.location.search)
    params.nocache = query.nocache == 'true' ? true : false
    return params

}

// This is a route
class Filter_Page_Section_Row extends React.Component {

  props: Props

  constructor(props : Props) {
    super(props)
  }

  componentWillUpdate(nextProps, b) {
    const params = props_to_params(nextProps)
    const current_params = props_to_params(this.props)

    match({
        Nothing: () => {
          // compatiblity with affiliate_name in the filter part of the URL
          const filter = R.pipe(
              R.split(',')
            , R.map(R.split('='))
          )(params.filter)
          const affiliate_tuple = filter.find(([key, val]) => key == 'affiliate_name')
          if(!!affiliate_tuple) {
            if(maybe.isJust(nextProps.all_affiliates)) {
              const affiliate_ids = R.pipe(
                  R.filter(x => x.affiliate_name == affiliate_tuple[1])
                , R.chain(x => x.affiliate_ids)
                , R.join(';')
              )(nextProps.all_affiliates)

              params.filter = R.pipe(
                R.map(([key, value]) => key == 'affiliate_name'
                  ? ['affiliate_id', affiliate_ids]
                  : [key, value]
                )
                , R.map(R.join('='))
                , R.join(',')
              )(filter)

              nextProps.fetch_filter_page_section_row(params.timezone, params.date_from, params.date_to, params.filter, params.page, params.section, params.row, params.nocache)  
            }
          } else {
            nextProps.fetch_filter_page_section_row(params.timezone, params.date_from, params.date_to, params.filter, params.page, params.section, params.row, params.nocache)
          }
        }
      , Loading: () => void 9
      , Error: (error) => void 9
      , Loaded: (data) => void 9
    })(nextProps.data)

    if(current_params.date_from != params.date_from || current_params.date_to != params.date_to) {
      nextProps.fetch_all_countries(params.date_from, params.date_to)
    }
  }

  componentWillMount() {
    if(maybe.isNothing(this.props.all_affiliates)) {
      this.props.fetch_all_affiliates()
    }
    if(maybe.isNothing(this.props.all_countries)) {
      const {params} = this.props.match
      this.props.fetch_all_countries(params.date_from, params.date_to)
    }
  }

  render() {
    const params = props_to_params(this.props)

    const data_component = match({
        Nothing: () => <div>Nothing</div>
      , Loading: () => <div>Loading</div>
      , Error: (error) => <div>Error</div>
      , Loaded: (data) => maybe.isNothing(this.props.affiliates_mapping)
        ? <div>Loading affiliates...</div>
        : <Tabs 
          pages={data} 
          params={params}
          sort={ this.props.sort }
          affiliates={ this.props.affiliates_mapping }
          onSort={ (field, order) => this.props.sort_row_filter_page_section_row(field, order) } />
    })(this.props.data)

    return <div>
      <ThemeProvider theme={theme}>
        {
          maybe.maybe(
              _ => {
                return <div>Loading...</div>
              }
            , all_countries => _ => maybe.maybe(
                _ => {
                  return <div>Loading affiliates ...</div>
                }
                , all_affiliates => _ => {
                  return  <Controls params={ params }
                    countries={ all_countries }
                    affiliates={ all_affiliates }
                    set_params={ params => {
                      this.props.set_params(params)
                      this.props.cleanup_fetch_filter_page_section_row()
                      const query = params.nocache ? `?nocache=true` : ''
                      this.props.history.push(`/filter_page_section_row/${formatTimezone(params.timezone)}/${params.date_from}/${params.date_to}/${params.filter}/${params.page}/${params.section}/${params.row}${query}`)
                    } }
                    className='top'
                  />
                }
              , this.props.all_affiliates
            )()
            , this.props.all_countries
          )()
        }
      </ThemeProvider>
      { data_component }
    </div>
  }
}

export default connect(
    state => ({
        data: filter_page_section_row_selector(state)
      , affiliates_mapping: affiliates_mapping_selector(state)
      , sort: state.sort
      , all_countries: state.all_countries 
      , all_affiliates: state.all_affiliates
    })
  , {
        fetch_all_countries
      , fetch_all_affiliates
      , fetch_filter_page_section_row, cleanup_fetch_filter_page_section_row, sort_row_filter_page_section_row
      , set_params 
    }
)(Filter_Page_Section_Row)
