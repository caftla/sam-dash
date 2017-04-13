import React from 'react'
import { connect } from 'react-redux'
import { ThemeProvider } from 'styled-components'

import * as maybe from 'flow-static-land/lib/Maybe'
import type { Maybe } from 'flow-static-land/lib/Maybe'

import { fetch_all_countries, fetch_filter_section_row, cleanup_fetch_filter_section_row, set_params } from '../../actions'
import type { QueryParams, FetchState } from 'my-types'

import Section from './Section'
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
    data: FetchState<Array<any>>
  , params: QueryParams
  , fetch_filter_section_row: (params: QueryParams) => void
  , fetch_all_countries: (date_from: string, date_to: string) => void
  , all_countries: Maybe<Array<any>>
  , cleanup_fetch_filter_section_row: () => void
  , set_params: (params: QueryParams) => void
}

// This is a route
class Filter_Section_Row extends React.Component {
  constructor(props : Props) {
    super(props)
    console.log('Filter_Section_Row props', this.props)
    const {params} = this.props.match
    this.props.set_params(params)
    if(this.props.data == 'Nothing') {
      this.props.fetch_filter_section_row(params.date_from, params.date_to, params.filter, params.section, params.row)
    }
  }

  componentWillUpdate(nextProps, b) {

  }

  componentWillUnmount() {
  }

  render() {
    const {params} = this.props.match

    const data_component = this.props.data == 'Nothing' || this.props.data == 'Loading'
      ? <div>Loading ...</div>
      : <div>{ this.props.data.map((x,i) => <Section key={i} data={x} />) }</div>
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
                    this.props.cleanup_fetch_filter_section_row()
                    this.props.fetch_all_countries(params.date_from, params.date_to)
                    this.props.history.push(`/filter_section_row/${params.date_from}/${params.date_to}/${params.filter}/${params.section}/${params.row}`)
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
    state => ({ data: state.filter_section_row, all_countries: state.all_countries })
  , { fetch_all_countries, fetch_filter_section_row, cleanup_fetch_filter_section_row, set_params }
)(Filter_Section_Row)
