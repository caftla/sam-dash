// @flow

import React from 'react'
import { ThemeProvider } from 'styled-components'

import * as maybe from 'flow-static-land/lib/Maybe'
import type { Maybe } from 'flow-static-land/lib/Maybe'

import type { QueryParams } from 'my-types'
import type { FetchState } from '../../adts'
import { match, fetchState } from '../../adts'
import { fromQueryString } from '../../helpers'

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
  , fetch_data: (date_from : string, date_to : string, filter : string, page : string, section : string, row : string) => void
  , fetch_all_countries: (date_from: string, date_to: string) => void
  , all_countries: Maybe<Array<any>>
  , fetch_all_affiliates: () => void
  , all_affiliates: Maybe<Array<any>>
  , cleanup_fetch_data: () => void
  , sort_row_filter_page_section_row: (field: string, order: number) => void
  , sort: any
  , set_params: (params: QueryParams) => void
}

const props_to_params = props => {
  const {timeFormat} = require('d3-time-format')
  const formatDate = timeFormat('%Y-%m-%d')
  const defaultDateFrom = formatDate(new Date(new Date().valueOf() - 7 * 24 * 3600 * 1000))
  const defaultDateTo   = formatDate(new Date(new Date().valueOf() + 1 * 24 * 3600 * 1000))
  const {params} = props.match
  const { format : d3Format } = require('d3-format')
  const formatTimezone = d3Format("+.1f")
  const query = fromQueryString(props.location.search)
  const toSorter = x => !x ? null : R.pipe(
      R.split(',')
    , xs => [R.head(xs)].concat(R.map(parseInt)(R.tail(xs)))
    , ([field, order, minViews, minSales]) => ({field, order, minViews, minSales})
    )(x)

  const mparams = R.merge(params, R.applySpec({
      timezone: () => isNaN(parseFloat(params.timezone)) ? new Date().getTimezoneOffset() / -60 : parseFloat(params.timezone)
    , nocache:  () => query.nocache == 'true' ? true : false
    , date_from: p => p.date_from || defaultDateFrom
    , date_to: p => p.date_to || defaultDateTo
    , filter: p => p.filter || '-'
    , page: p => p.page || '-'
    , section: p => p.section || '-'
    , row: p => p.row || 'day'
    , tabSorter: _ => toSorter(query.tabSorter) || props.controls.tabSorter
    , sectionSorter: _ => toSorter(query.sectionSorter) || props.controls.sectionSorter
    , rowSorter: _ => toSorter(query.rowSorter) || props.controls.rowSorter
  })(params))
  return R.merge(props.controls, mparams)
}



export default function(component_params) {

  const {make_path, Tabs, Controls, require_filter, render, DataComponent} = component_params

  const make_url = params => {
    const sortToQuery = (type, { field, order, minViews, minSales }) => `${type}=${field},${order},${minViews},${minSales}`
    const makeQuery = tuples => '?' + R.pipe(R.filter(x => !!x), R.join('&'))(tuples)

    const query = makeQuery([
      (params.nocache ? `nocache=true` : '')
      , (!!params.tabSorter ? sortToQuery('tabSorter', params.tabSorter) : '')
      , sortToQuery('sectionSorter', params.sectionSorter)
      , sortToQuery('rowSorter', params.rowSorter)
    ])

    return make_path(params, query)
  }
  const go = (history, params) => history.push(make_url(params))

  // This is a route
  class Component extends React.Component {

    props: Props

    unlisten : any
    route_changed: false


    constructor(props : Props) {
      super(props)

      this.unlisten = this.props.history.listen((location, action) => {
        this.props.cleanup_fetch_data()
        this.route_changed = true
      });

      this.props.set_params(props_to_params(props))
    }

    componentWillUnMount() {
      if(!!this.unlisten) {
        this.unlisten();
      }
    }

    componentWillUpdate(nextProps, b) {
      const params = props_to_params(nextProps)
      const current_params = props_to_params(this.props)
      
      const data = this.route_changed ? fetchState.Nothing() : nextProps.data
      this.route_changed = false

      match({
          Nothing: () => {
            if(params.filter == '-' && require_filter) {
              void 9
            } else {
              // compatiblity with affiliate_name in the filter part of the URL
              const filter = R.pipe(
                  R.split(',')
                , R.map(R.split('='))
              )(params.filter || '-')
              const affiliate_tuple = filter.find(([key, val]) => key == 'affiliate_name')
              if(!!affiliate_tuple) {
                if(maybe.isJust(nextProps.all_affiliates)) {
                  const affiliate_ids = R.pipe(
                      R.filter(x => x.affiliate_name == affiliate_tuple[1])
                    , R.chain(x => x.affiliate_ids)
                    , R.join(';')
                  )(nextProps.all_affiliates)

                  params.filter = R.pipe(
                    R.reject(([key, value]) => !value || value == '-')
                    , R.map(([key, value]) => key == 'affiliate_name'
                      ? ['affiliate_id', affiliate_ids]
                      : [key, value]
                    )
                    , R.map(R.join('='))
                    , R.join(',')
                  )(filter)

                  nextProps.fetch_data(params.timezone, params.date_from, params.date_to, params.filter, params.page, params.section, params.row, params.nocache)  
                }
              } else {
                nextProps.fetch_data(params.timezone, params.date_from, params.date_to, params.filter, params.page, params.section, params.row, params.nocache)
              }
            }
          }
        , Loading: () => void 9
        , Error: (error) => void 9
        , Loaded: (data) => void 9
      })(data)

      if(current_params.date_from != params.date_from || current_params.date_to != params.date_to) {
        nextProps.fetch_all_countries(params.date_from, params.date_to)
      }
    }

    componentWillMount() {
      
      const params = props_to_params(this.props)
      if(maybe.isNothing(this.props.all_affiliates)) {
        this.props.fetch_all_affiliates(params.date_from, params.date_to)
      }
      if(maybe.isNothing(this.props.all_countries)) {
        this.props.fetch_all_countries(
            params.date_from
          , params.date_to
        )
      }
    }

    render() {
      const params = props_to_params(this.props)

      if(!!component_params.render) {
        return component_params.render.apply(this, [params, go])
      }

      const TabsComponent = data => !!component_params.DataComponent
        ? <DataComponent 
            data={data} 
            params={params}
            sort={ { rowSorter: params.rowSorter, sectionSorter: params.sectionSorter, tabSorter: params.tabSorter } }
            affiliates={ this.props.affiliates_mapping } />
        : <Tabs 
            pages={data} 
            params={params}
            sort={ { rowSorter: params.rowSorter, sectionSorter: params.sectionSorter, tabSorter: params.tabSorter } }
            affiliates={ this.props.affiliates_mapping }
            controls={ this.props.controls }
            make_url={ make_url }
            onSort={ (row_or_section, field, order) => {
              //TODO: remove sort_row_filter_page_section_row and sort_row_filter_page_section functions from actions
              const nparams = row_or_section == 'row'
                ? R.merge(params, {
                  rowSorter: R.merge(params.rowSorter, { field, order: (params.rowSorter.field == field ? -1 : 1) * params.rowSorter.order  })
                }) 
                : R.merge(params, {
                  sectionSorter: R.merge(params.sectionSorter, { field, order: (params.sectionSorter.field == field ? -1 : 1) * params.sectionSorter.order  })
                })

                this.props.set_params(nparams)

                go(this.props.history, nparams)
            }
            } />

      const data_component = match({
          Nothing: () => <div style={ {margin: '2em'} }>{(params.filter == '-' && require_filter) ? 'Please select some filters first' : 'Nothing' } </div>
        , Loading: () => <div>Loading</div>
        , Error: (error) => <div>Error</div>
        , Loaded: (data) => maybe.isNothing(this.props.affiliates_mapping)
          ? <div>Loading affiliates...</div>
          : TabsComponent(data)
      })(this.props.data)

      const controls_component = <ThemeProvider theme={theme}>
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
                  return  <Controls
                    className="main-left show"
                    params={ params }
                    countries={ all_countries }
                    affiliates={ all_affiliates }
                    sort={ { rowSorter: params.rowSorter, sectionSorter: params.sectionSorter, tabSorter: params.tabSorter } }
                    set_params={ params => {

                      this.props.set_params(params)
                      this.props.cleanup_fetch_data()

                      //TODO: remove all traces of min_views=${this.props.sort.rowSorter.minViews}&min_sales=${this.props.sort.rowSorter.minSales}
                      
                      go(this.props.history, params)
                    } }
                    set_min={ (views_or_sales, value) => {
                      this.props.min_row_filter_page_section_row(views_or_sales, value)
                    } }
                  />
                }
              , this.props.all_affiliates
            )()
            , this.props.all_countries
          )()
        }
        </ThemeProvider>

      return <div className="main-bottom">
        <div id="sidebar" className="visible">
          <div id="filters">
            { controls_component }
          </div>
        </div>
        <div id="container" className="default">
          { data_component } 
        </div>
      </div>
    }
  }

  return Component
}