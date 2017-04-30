// @flow

// converting_ips

import React from 'react'
import { connect } from 'react-redux'
import { ThemeProvider } from 'styled-components'
import * as maybe from 'flow-static-land/lib/Maybe'
import type { Maybe } from 'flow-static-land/lib/Maybe'
import R from 'ramda'

import type { QueryParams } from 'my-types'
import { fetchState, match } from '../../adts'
import type { FetchState } from '../../adts'
import converting_ips_selector from '../../selectors/converting_ips.js'

import Tabs from '../plottables/tabs'


import {
    fetch_all_countries , set_params
  , fetch_converting_ips, cleanup_fetch_converting_ips, sort_row_filter_page_section_row
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
  , fetch_converting_ips: (date_from : string, date_to : string, filter : string) => void
  , fetch_all_countries: (date_from: string, date_to: string) => void
  , all_countries: Maybe<Array<any>>
  , cleanup_fetch_converting_ips: () => void
  , sort_row_filter_page_section_row: (field: string, order: number) => void
  , sort: { field: string, order: number }
  , set_params: (params: QueryParams) => void
}

const Section = props => {
  return <div>Section</div>
}

const d3 = require('d3-format')
import {TD, TH, TABLE} from '../plottables/table'

const Page = ({page, sales, data, params, onSort, sort} :
  { page: string, sales: number, data: Array<any>, params: QueryParams, onSort: (string, number) => void, sort: { field: string, order: number } }) => {
  const show_label = (name, key = null) => {
    const sort_field = key == null ? name : key
    return sort_field == sort.field
      ? `${name} ` + (sort.order > 0 ? '▲' : '▼')
      : name
  }
  return <TABLE width={1020}>
   <thead>
     <tr>
       <TH width={150} value={ show_label(params.row, 'row') } onClick={ () => onSort('row', 1) }  />
       <TH width={150} value={ show_label('From', 'from') } onClick={ () => onSort('from', 1) } />
       <TH width={150} value={ show_label('To', 'to') } onClick={ () => onSort('to', 1) } />
       <TH width={150} value={ show_label('Views', 'views') } onClick={ () => onSort('views', 1) } />
       <TH width={150} value={ show_label('Sales', 'sales') } onClick={ () => onSort('sales', 1) } />
       <TH width={150} value={ show_label('CQ', 'cq') } onClick={ () => onSort('cq', 1) } />
     </tr>
   </thead>
   <tbody>{
     data.map((x, i) => <tr key={i}>
       <TD width={150} value={x.operator} style={{ paddingLeft: '0.7em' }}  />
       <TD width={150} value={x.from} />
       <TD width={150} value={x.to} />
       <TD width={150} value={x.views} />
       <TD width={150} value={x.sales} />
       <TD width={150} value={x.firstbillings} />
     </tr>)
   }
     <tr>
       <TD width={150} value="" />
       <TD width={150} value="" />
       <TD width={150} value="" />
       <TD width={150} value="" />
       <TD width={150} value="" />
       <TD width={150} value="" />
     </tr>
   </tbody>
 </TABLE>
}

class Cohort extends React.Component {

  props: Props

  constructor(props : any) {
    super(props)
  }

  componentWillUpdate(nextProps : Props, b) {
    const {params} = nextProps.match
    const current_params = this.props.match.params

    match({
        Nothing: () => nextProps.fetch_converting_ips(params.date_from, params.date_to, params.filter)
      , Loading: () => void 9
      , Error: (error) => void 9
      , Loaded: (data) => void 9
    })(nextProps.data)

    if(current_params.date_from != params.date_from || current_params.date_to != params.date_to) {
      nextProps.fetch_all_countries(params.date_from, params.date_to)
    }
  }

  render() {
    const {params} = this.props.match
    const data_component = match({
        Nothing: () => <div>Nothing</div>
      , Loading: () => <div>Loading...</div>
      , Error: (error) => <div>Error</div>
      , Loaded: (data) => {
          return <Tabs pages={data} params={params}
                sort={ this.props.sort  } // this.props.sort
                onSort={ (field, order) => this.props.sort_row_filter_page_section_row(field, order) }
                page={ Page }
                />
        }
    })(this.props.data)

    return <div>
      <ThemeProvider theme={theme}>
        {
          maybe.maybe(
              _ => {
                this.props.fetch_all_countries(params.date_from, params.date_to)
                return <div>Loading...</div>
              }
            , all_countries => _ => {
                return  <Controls params={ params }
                  countries={ all_countries }
                  set_params={ params => {
                    this.props.set_params(params)
                    this.props.cleanup_fetch_converting_ips()
                    this.props.history.push(`/converting_ips/${params.date_from}/${params.date_to}/${params.filter}/${params.page}`)
                  } }
                />
              }
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
        all_countries: state.all_countries
      , data: converting_ips_selector(state)
      , sort: state.sort
    })
  , {
        fetch_all_countries, set_params
      , fetch_converting_ips, cleanup_fetch_converting_ips, sort_row_filter_page_section_row
    }
)(Cohort)
