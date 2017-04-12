// @flow

import React from 'react'
import { connect } from 'react-redux'
import { Redirect } from 'react-router'

import Controls  from './filter_section_row/Controls'

import type { QueryParams } from 'my-types'
import { fetch_all_countries, set_params, cleanup_fetch_filter_section_row } from '../actions'

import * as maybe from 'flow-static-land/lib/Maybe'
import type { Maybe } from 'flow-static-land/lib/Maybe'

type HomeProps = {
    params: QueryParams
  , set_params: QueryParams => void
  , cleanup_fetch_filter_section_row: () => void
  , fetch_all_countries: (date_from: string, date_to: string) => void
  , all_countries: Maybe<Array<any>>
  , history: any
}

class Home extends React.Component {
  props: HomeProps

  constructor(props: HomeProps) {
    super(props)
    console.log('Home', props)
  }

  render() {

    const { params } = this.props
    return <div>
      {process.env.connection_string}
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
  </div>
  }
}

export default connect(
    state => ({ params: state.controls, all_countries: state.all_countries  })
  , { fetch_all_countries, set_params, cleanup_fetch_filter_section_row }
)(Home)
