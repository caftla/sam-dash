import React, {Component } from 'react'
import { connect } from 'react-redux'
import { Route } from "react-router"
import { grommet } from "grommet/themes";
import { Grommet, Tabs, Tab, Box, ThemeContext} from "grommet";
import { deepMerge } from "grommet/utils";
import { css } from "styled-components";


import Loader from "../loader";
import PublishedPages from "./campaign-table";
import Modal from "../modal";
import CreateCampaign from "./create-campaign-modal";
import SubMenu from "../submenu"
import {
  fetch_uploaded_pages,
  fetch_released_pages,
  publish_page,
  create_campaign,
  toggle_show_link,
  create_camapign,
  toggle_create_campaign,
  fetch_get_sources
} from '../../../actions'

import "../ouisys_pages.styl";

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
    this.props.fetch_get_sources();
  }


  render() {

    return (
      <Grommet theme={customTheme}>
          <div className="top-spacer">
          
            <div id="tabs-area">
              
            <SubMenu id="campaigns"/>
            <h1>Manage Campaigns</h1>
            </div>
          <Tabs flex="grow" justify="center" >
            <Tab title="Published Pages">
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
                  <PublishedPages
                    publishedPages={this.props.released_pages}
                    create_camapign={this.props.create_camapign}
                    toggle_create_campaign={this.props.toggle_create_campaign}
                  />
                }
              </Box>
              </Tab>
              <Tab title="Created Campaigns">

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
              <Modal
                toggleShowLink={this.props.toggle_show_link}
                created_campaign={this.props.created_campaign}
                title="Campaign created successfully!"
                created_campaign={this.props.created_campaign}
              />
            }
            {
              this.props.show_create_campaign.show &&
              <CreateCampaign
                show_create_campaign={this.props.show_create_campaign}
                create_campaign={this.props.create_campaign}
                sources={this.props.sources}
                toggle_create_campaign={this.props.toggle_create_campaign}
              />
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
    is_loading: state.is_loading,
    show_create_campaign: state.show_create_campaign,
    sources: state.sources,
    created_campaign: state.created_campaign
      
  })
, {
    fetch_uploaded_pages,
    fetch_released_pages,
    publish_page,
    create_campaign,
    toggle_show_link,
    toggle_create_campaign,
    fetch_get_sources
  }
) (ViewComponent)
