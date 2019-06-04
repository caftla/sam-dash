import React, {Component } from 'react'
import { connect } from 'react-redux'
import { Route } from "react-router"
import { grommet } from "grommet/themes";
import { Grommet, Tabs, Tab, Box, ThemeContext} from "grommet";
import { deepMerge } from "grommet/utils";
import { css } from "styled-components";
import {CopyToClipboard} from 'react-copy-to-clipboard';


import Loader from "../loader";
import PublishedPages from "./published-pages";
import CampaignsTable from "./campaign-table";
import Modal from "../modal";
import CreateCampaign from "./create-campaign-modal";
import SubMenu from "../submenu"
import moment from "moment"
import {
  fetch_uploaded_pages,
  fetch_released_pages,
  publish_page,
  create_campaign,
  toggle_show_link,
  create_camapign,
  toggle_create_campaign,
  fetch_get_sources,
  get_all_campaigns,
  find_campaigns,
  reset_existing_campaigns,
  update_campaign_status,
  create_multiple_campaigns
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
    this.state = {
      route: props.location.pathname.substring(1).split('/')[0],
      showShare:false,
      copied: false,
      shareValues:{},
      copiedMulti:{}
    }
  }
  componentWillMount() {
    this.props.fetch_uploaded_pages();
    this.props.fetch_released_pages();
    this.props.fetch_get_sources();
    this.props.get_all_campaigns();
    this.getQueryParams();
  }

  getQueryParams(){
    if(window.location.search !== ""){
      const { search } = window.location;
      const parsed = this.parseQuery(search);
      console.log("PARSED", parsed)
      const {country, page, scenario, strategy, scenarios_config } = parsed;

      if(country, page, scenario){
        this.props.toggle_create_campaign({show:true, data:{
          country,
          page,
          scenario
        }})
      }
      if(country, page, strategy, scenarios_config){
        this.props.toggle_create_campaign({show:true, data:{
          country,
          page,
          strategy,
          scenarios_config
        }}) 
      }
    }
  }

  parseQuery(queryString) {
    var query = {};
    var pairs = (queryString[0] === '?' ? queryString.substr(1) : queryString).split('&');
    for (var i = 0; i < pairs.length; i++) {
        var pair = pairs[i].split('=');
        query[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1] || '');
    }
    return query;
  }

  toggleShowShare(payload){
    this.setState({
      showShare: payload.show,
      shareValues: payload.data
    })
  }
  copy(id) {
    const copyText = document.querySelector(`#${id}`);
    copyText.select();
    document.execCommand("copy");
    this.setState({copied: true})
  }

  render() {

    return (
      <Grommet theme={customTheme}>
          <div className="top-spacer">
          
            <div id="tabs-area">
              
            <SubMenu id="campaigns"/>
            
            </div>
            { 
              
              !this.props.show_create_campaign.show &&
              <div>
                <h1>Manage Campaigns</h1>
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
                          toggleShowShare={this.toggleShowShare.bind(this)}
                          fetch_released_pages={this.props.fetch_released_pages}
                        />
                      }
                    </Box>
                    </Tab>
                    <Tab title="Created Campaigns">
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
                        (Array.isArray(this.props.all_campaigns) && this.props.all_campaigns.length > 0) &&
                        <CampaignsTable
                          all_campaigns={this.props.all_campaigns}
                          get_all_campaigns={this.props.get_all_campaigns}
                          update_campaign_status={this.props.update_campaign_status}
                        />
                      }
                    </Box>
                  </Tab>
                </Tabs>
              </div>
            }
            <div className="top-spacer publish-wrapper">

            </div>

            {
              this.props.is_loading &&
              <Loader />
            }
            {
              (this.props.show_link_modal === true && this.props.created_campaign.hasOwnProperty("xcid")) &&
              <Modal
                close={()=>this.props.toggle_show_link(false)}
                toggleShowLink={this.props.toggle_show_link}
                created_campaign={this.props.created_campaign}
                title="Campaign created successfully!"
                created_campaign={this.props.created_campaign}
              />
            }

            {
              (this.props.show_link_modal === true && Array.isArray(this.props.created_multiple_campaigns)) &&
              //true &&
              <Modal
                close={()=>this.props.toggle_show_link(false)}
                toggleShowLink={this.props.toggle_show_link}
                title="Campaign created successfully!"
                custom={()=>{
                  return(
                    <div>
                      <h1>Campaigns created successfully!</h1>
                      <div className="created_multi_campaigns">
                        <table>
                        <thead>
                          <tr>
                            <th>Affiliate id</th>
                            <th>Link</th>
                            <th>Comments</th>
                            <th>Date</th>
                            <th>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                        {
                            this.props.created_multiple_campaigns.map((tObj, index)=>{
                              const url = (tObj.affiliate_id === "FREE-ANY" || tObj.affiliate_id === "FREE-POP") ? 
                              `https://c1.ouisys.com/${tObj.xcid}?offer={offer_id}` :  `https://c1.ouisys.com/${tObj.xcid}`;
              
                                return (
                                    <tr>
                                      <td>
                                        {tObj.affiliate_id}
                                      </td>
                                      <td>
                                        <a target="_blank" href={url}>{url}</a>
                                        <input className="temp-input" id={tObj.affiliate_id + index} value={url}/>
                                      </td>
                                      <td>
                                        {tObj.comments}
                                      </td>
                                      <td>
                                        {moment(tObj.date_created).format("MMM Do YY")}
                                      </td>
                                      <td>

                                      {this.state.copiedMulti[tObj.xcid] ? <span style={{color: 'red'}}>Copied.</span> : null}
          
                                      {/* <input id="share-url" readOnly value={url}/> */}
                                        <button onClick={()=>{
                                          this.copy(tObj.affiliate_id + index);
                                          this.setState({
                                            copiedMulti:{
                                              [tObj.xcid]: true
                                            }
                                          })

                                        }}
                                        type="button" className="btn btn-warning">Copy</button>
                                      </td>
                                    </tr>
                                ) 
                              
                            })
                          }
                        </tbody>
                        </table>
                            </div>
                    </div>
                  )
                }}
                created_multiple_campaigns={this.props.created_multiple_campaigns}
              />

            }
            {
              this.props.show_create_campaign.show &&
              <CreateCampaign
                show_create_campaign={this.props.show_create_campaign}
                create_campaign={this.props.create_campaign}
                sources={this.props.sources}
                toggle_create_campaign={this.props.toggle_create_campaign}
                find_campaigns={this.props.find_campaigns}
                searched_campaigns={this.props.searched_campaigns || []}
                reset_existing_campaigns={this.props.reset_existing_campaigns}
                create_multiple_campaigns={this.props.create_multiple_campaigns}
              />
            }

            {
              this.state.showShare &&
              <Modal
                customClass="share-campaign-url-wrapper"
                close={()=>{
                  this.toggleShowShare({});
                  this.setState({copied:false})

                }}
                custom={()=>{
                  const { country, page, scenario, strategy, scenarios_config } =  this.state.shareValues;
                  const url = scenario ?
                  `https://sigma.sam-media.com/ouisys-pages/campaigns/?country=${country}&page=${page}&scenario=${scenario}`
                  : `https://sigma.sam-media.com/ouisys-pages/campaigns/?country=${country}&page=${page}&strategy=${strategy}&scenarios_config=${scenarios_config}`
                  return(
                    <div onClick={()=>this.copy("share-url")}>
                      <input id="share-url" readOnly value={url}/> 
                      <p>{this.state.copied ? <span style={{color: 'red'}}>Copied.</span> : null}</p>
                    </div>
                  ) 
                }
                  
                }
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
    created_campaign: state.created_campaign,
    all_campaigns: state.all_campaigns,
    searched_campaigns: state.searched_campaigns,
    created_multiple_campaigns: state.created_multiple_campaigns
      
  })
, {
    fetch_uploaded_pages,
    fetch_released_pages,
    publish_page,
    create_campaign,
    toggle_show_link,
    toggle_create_campaign,
    fetch_get_sources,
    get_all_campaigns,
    find_campaigns,
    reset_existing_campaigns,
    update_campaign_status,
    create_multiple_campaigns
  }
) (ViewComponent)
