// @flow

// converting_ips

import React from 'react'
import { connect } from 'react-redux'
import R from 'ramda'
import type { QueryParams } from 'my-types'

import Elm from 'react-elm-components'
// $FlowFixMe
import { Chat } from '../share/index.elm'


type Props = {
    match: { params: QueryParams }
  , history: any
}

class DailyReportsArchive extends React.Component {

  props: Props

  constructor(props : any) {
    super(props)
  }

  componentWillUpdate(nextProps : Props, b) {
    const {params} = nextProps.match
    const current_params = this.props.match.params
  }

  componentDidMount() {
    const {params} = this.props.match
  }

  render() {
    const {params} = this.props.match
    const self = this

    let sendEmojiToChat = function() {};

    function setupPorts(ports) {
      console.log('ports', ports)
      sendEmojiToChat = ports.emoji.send;
      ports.downloaded.subscribe(function(content) {
        console.log('download', content)
        self.refs.content.innerHTML = content
      })
      
      // test the port:
      sendEmojiToChat(':)')
    };

    const flags = params.date_from;

    return <div className='main-bottom' style={{ margin: '1em 1em 1em 1em' }}>
        <Elm src={Chat} flags={ flags } ports={setupPorts} />
        <div className='daily-reports-archive-content' ref="content" />
      </div>
  }
}

export default connect(
    state => ({
    })
  , {
    }
)(DailyReportsArchive)
