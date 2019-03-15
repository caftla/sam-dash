import React, {Component } from 'react'
import { connect } from 'react-redux'
import { Route } from "react-router"
import { grommet } from "grommet/themes";
import { Grommet, Tabs, Tab, Box, ThemeContext} from "grommet";
import { deepMerge } from "grommet/utils";
import { css } from "styled-components";


import Loader from "./loader";
import UploadedPages from "./uploaded_pages";
import PublishedPages from "./published_pages";
import Modal from "./modal";
import { fetch_uploaded_pages, fetch_released_pages, publish_page, create_campaign, toggle_show_link} from '../../actions'

import "./ouisys_pages.styl";

const customTheme = deepMerge({
  global: { colors: { sam: '#6da424' } },
  tab: {
    active: {
      color: 'sam'
    }
  }
}, grommet)

class ViewComponent extends Component {
  constructor(props){
    super(props)
    this.state = {route: props.location.pathname.substring(1).split('/')[0]}
  }
  componentWillMount() {
    this.props.fetch_uploaded_pages();
    this.props.fetch_released_pages();
  }


  render() {

    return (
      <Grommet theme={customTheme}>
          <div className="top-spacer">
          
            <div id="tabs-area">
              <ul>
                <li><a className="active" href={`/ouisys-pages` } >Manage Pages</a></li>
                <li><a href="/ouisys-pages/legals" >Manage Legal Text</a></li>
              </ul>
            </div>
            <Tabs flex="grow" justify="center" >
              <Tab title="Unpublished">
                <Box
                  fill
                  pad={{
                    left: 'small', right: 'small'
                  }}
                  margin={{
                    top: 'medium'
                  }}
                  overflow="auto"
                  align="center"
                >
                  {
                    (Array.isArray(this.props.uploaded_pages) && this.props.uploaded_pages.length > 0) &&
                    <UploadedPages uploadedPages={this.props.uploaded_pages} publishPage={this.props.publish_page} />
                  }
                </Box>
              </Tab>
              <Tab title="Published">
                <Box
                  fill
                  pad={{
                    left: 'small', right: 'small'
                  }}
                  margin={{
                    top: 'medium'
                  }}
                  overflow="auto"
                  align="center"
                >
                  {
                    (Array.isArray(this.props.released_pages) && this.props.released_pages.length > 0) &&
                    <PublishedPages publishedPages={this.props.released_pages} />
                  }
                </Box>
              </Tab>
            </Tabs>
            <div className="top-spacer publish-wrapper">

            </div>

            {
              this.props.is_loading &&
              <Loader />
            }
            {
              (this.props.show_link_modal === true && this.props.created_campaign.hasOwnProperty("xcid")) &&
              <Modal toggleShowLink={this.props.toggle_show_link} created_campaign={this.props.created_campaign} />
            }
          </div>
      </Grommet>
    );
  }
}



export default connect(
  state => ({
    uploaded_pages: state.uploaded_pages,
    released_pages: state.released_pages,
    published_page: state.published_page,
    created_campaign: state.created_campaign,
    show_link_modal: state.show_link_modal,
    is_loading: state.is_loading
      
  })
, {
    fetch_uploaded_pages,
    fetch_released_pages,
    publish_page,
    create_campaign,
    toggle_show_link
  }
) (ViewComponent)
