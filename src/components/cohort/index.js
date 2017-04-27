// @flow

import React from 'react'
import { connect } from 'react-redux'
import R from 'ramda'

//TODO: temp
import { get } from '../../helpers'

import { fetchState, match } from '../../adts'
import type { FetchState } from '../../adts'


import Table from './Table'

class Cohort extends React.Component {

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
    get({url: `/api/v1/cohort/${date_from}/${date_to}/${filter}`, cache: "force-cache"}, {cache: "force-cache"})
    .then(res => this.setState({res : fetchState.Loaded(res)}))

  }

  render() {
    const {params} = this.props.match
    return match({
        Nothing: () => <div>Nothing</div>
      , Loading: () => <div>Loading...</div>
      , Error: (error) => <div>Error</div>
      , Loaded: (data) => {
          return <Table data={data} />
        }
    })(this.state.res)
  }
}

export default connect(
    state => ({
        // data: filter_page_section_row_selector(state)
      all_countries: state.all_countries })
  , {
    }
)(Cohort)
