// @flow

import React from 'react'
import { connect } from 'react-redux'
import { Redirect } from 'react-router'

import Controls  from './filter_section_row/Controls'

import type { QueryParams } from 'my-types'
import { set_params, cleanup_fetch_filter_section_row } from '../actions'

import * as maybe from 'flow-static-land/lib/Maybe'
import type { Maybe } from 'flow-static-land/lib/Maybe'

type HomeProps = {
    params: QueryParams
  , set_params: QueryParams => void
  , cleanup_fetch_filter_section_row: () => void
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
    return <Controls
      params={ this.props.params }
      set_params={ params => {
        this.props.set_params(params)
        this.props.cleanup_fetch_filter_section_row()
        this.props.history.push(`/filter_section_row/${params.date_from}/${params.date_to}/${params.filter}/${params.section}/${params.row}`)
      } }
    />
  }
}

export default connect(
    state => ({ params: state.controls  })
  , { set_params, cleanup_fetch_filter_section_row }
)(Home)
