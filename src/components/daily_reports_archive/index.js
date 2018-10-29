// @flow

// converting_ips

import React from 'react'
import { connect } from 'react-redux'
import R from 'ramda'
import type { QueryParams } from 'my-types'



type Props = {
    match: { params: QueryParams }
  , history: any
}

class DailyReportsArchive extends React.Component {

  props: Props

  constructor(props : any) {
    super(props)
    this.state = {
      html: "<div>Loading</div>"
    }
    this.download(props)
  }

  componentWillUpdate(nextProps : Props, b) {
    const {params} = nextProps.match
    const current_params = this.props.match.params
  }

  componentDidMount() {
    const {params} = this.props.match
  }
  componentDidUpdate(prevProps, prevState, snapshot) {
    this.download(this.props)
  }

  download(props) {
    const {params} = props.match
    const flags = { dateFrom: params.date_from, directory: props.match.path.indexOf('/hourly_reports_archive') == 0 ? 'hourly-archive' : 'archive' };
    fetch("https://caftla.github.io/daily-monitor/" + (flags.directory) + "/" + (flags.dateFrom) + ".html")
    .then(x => x.text())
    .then(html => {
      this.refs.html.innerHTML = html;
    })
    .catch(error => {
      this.refs.html.innerHTML = "Error " + error.toString();
    })
  }


  render() {
    
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

    

    return <div className='main-bottom' style={{ margin: '6em 1em 1em 1em' }}>
        <div ref="html">Loading ...</div>
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
