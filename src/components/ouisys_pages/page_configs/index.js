import React, {Component } from 'react'
import { connect } from 'react-redux'
import { Route } from "react-router"
import { grommet } from "grommet/themes";
import { Grommet, Tabs, Tab, Box, ThemeContext} from "grommet";
import { deepMerge } from "grommet/utils";
import { css } from "styled-components";
import {CopyToClipboard} from 'react-copy-to-clipboard';
import axios from "axios";


import Loader from "../loader";
import Modal from "../modal";
import SubMenu from "../submenu"
import moment from "moment"
import {
  get_handle,
  save_scenario_configuration
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
      username:null,
      password:null,
      showLogin:false,
      bupperUrl:"https://bupper.sam-media.com/ui/app/#/handle/edit/sa-speed-learn-pin?country=SA&deviceClasssmart&deviceClass=smart",
      isPin:false,
      isMo:false,
      isMoRedirect:false,
      isOneClick:false,
      isClick2SMS:false
    }
  }
  componentWillMount() {
    this.bupperLogin();
  }


  async bupperLogin(ev){
    const bupperUsername = localStorage.getItem("bupperUsername");
    const bupperPassword = localStorage.getItem("bupperPassword");

    const username = bupperUsername != null ? bupperUsername : this.state.username;
    const password = bupperPassword != null ? bupperPassword : this.state.password;

    if(username != null || password != null){
      const response = await fetch(`https://bupper.sam-media.com/api/resources/login?username=${username}&password=${encodeURIComponent(password)}`,
        {
          method: 'POST'
        }
      );
      const bupperUser = await response.json();
      if(bupperUser && bupperUser.accessToken){
        this.setState({isBupperAuth:true});
        localStorage.setItem("bpAccessToken", bupperUser.accessToken);
        this.setState({showLogin:false});
      }
    }else{
      this.setState({showLogin:true});
    }
  }

  async extractBupperUrl(ev){
    const bupperUsername = localStorage.getItem("bupperUsername");
    const bupperPassword = localStorage.getItem("bupperPassword");

    const bpAccessToken = localStorage.getItem("bpAccessToken");
    const urlParams = new URL(this.state.bupperUrl).hash.split(/[/?&=]/);
    const country = urlParams[5];
    const slug = urlParams[3];

    await this.props.get_handle({
      access_token:bpAccessToken,
      username:bupperUsername,
      password:encodeURIComponent(bupperPassword),
      country,
      slug
    });
  }

  resetState(){
    this.setState({
      isPin:false,
      isMo:false,
      isMoRedirect:false,
      isOneClick:false,
      isClick2SMS:false,
      username:null,
      password:null
    });
  }

  saveConfiguration(){
    const data = this.props.handle[0];
    this.props.save_scenario_configuration({
      config:{
        country:data.country.toLowerCase(),
        scenario:data.slug,
        device:data.deviceClass,
        service:data["brand-domain"].split(".")[1],
        host:data["brand-domain"]
      },
      flows:{ 
        "tallyman.v1-pin":this.state.isPin,
        "tallyman.v1-mo":this.state.isMo,
        "tallyman.v1-moredir":this.state.isMoRedirect,
        "bupper-one-click":this.state.isOneClick,
        "tallyman.v1-click2sms":this.state.isClick2SMS
      }
    })
  }

  componentDidUpdate(prevProps, prevState){
    if(prevProps.handle !== this.props.handle){
      const data = this.props.handle[0];
      this.resetState()
      if(data){
        data.scenario.optInFlows.map((optInFlow)=>{
          const flow = optInFlow.flow;
          switch(flow) {
            case "MSISDN > PIN > TQ":
              this.setState({isPin:true});
              break;
            case "MSISDN > MO > TQ":
              this.setState({isMo:true});
              break;
            case "MSISDN > MO > REDIRECT":
              this.setState({isMoRedirect:true});
              break;
            case "MSISDN > Confirm > TQ":
              this.setState({isOneClick:true});
              break;
            case "One click to sms":
              this.setState({isClick2SMS:true});
              break;
          }
        })
      }
    }
  }
  render() {
    const data = this.props.handle[0];
    return (
      <Grommet theme={customTheme}>
          <div className="top-spacer">
          
            <div id="tabs-area">
              
            <SubMenu id="page-configs"/>
            
            </div>
            { 
              
              //!this.props.show_create_campaign.show &&
              <div>
                <h1>Manage Configs</h1>
                <Tabs flex="grow" justify="center" >
                  <Tab title="Single-Flow Scenarios">
                    <div>
                    {
                      this.state.showLogin &&
                      <form className="bupperLogin" onSubmit={(ev)=>this.bupperLogin(ev)}>
                        <h1>Please Enter Your Bupper login details</h1>
                        <div className="os-ui-form-group">
                          <label>Username</label>
                          <input
                            type="text"
                            placeHolder="Username"
                            onChange={(ev)=>{
                              this.setState({username:ev.target.value})
                              localStorage.setItem("bupperUsername",ev.target.value)
                            }}
                          />
                        </div>
                        <br/>
                        <div className="os-ui-form-group">
                          <label>Password</label>
                          <input
                            type="password"
                            placeHolder="Password"
                            onChange={(ev)=>{
                              this.setState({password:ev.target.value});
                              localStorage.setItem("bupperPassword",ev.target.value)
                            }}
                          />
                          {this.state.password}
                        </div>
                        <div className="os-ui-form-group">
                          <button>Login</button>
                        </div>
                      </form>
                      ||
                      <div>
                        <div className="os-ui-col">
                          <div className="os-ui-form-group">
                            <label>Paste Bupper handle url</label>
                            <input
                              type="text"
                              placeHolder="Bupper handle url"
                              onChange={(ev)=>{
                                this.setState({
                                  bupperUrl:ev.target.value
                                })
                              }}
                            />

                            <div className="os-ui-form-group">
                              <button onClick={()=>this.extractBupperUrl()}>Go!</button>
                            </div>
                          </div>
                        </div>

                      {
                        data &&
                      
                        <div>
                          <div className="os-ui-col">
                            <div className="os-ui-form-group">
                              <label>Country</label>
                              <input
                                readOnly
                                type="text"
                                placeHolder="country"
                                value={data.country || ""}
                                onChange={(ev)=>{
                                  this.setState({
                                    country:ev.target.value
                                  })
                                }}
                              />
                            </div>

                            <div className="os-ui-form-group">
                              <label>Scenario</label>
                              <input
                                readOnly
                                type="text"
                                placeHolder="Scenario"
                                value={data.slug || ""}
                                onChange={(ev)=>{
                                  this.setState({
                                    scenario:ev.target.value
                                  })
                                }}
                              />
                            </div>
                          </div>

                          <div className="os-ui-col">
                            <div className="os-ui-form-group">
                              <label>Service</label>
                              <input
                                readOnly
                                type="text"
                                placeHolder="Service"
                                value={data["brand-domain"].split(".")[1] || ""}
                                onChange={(ev)=>{
                                  this.setState({
                                    service:ev.target.value
                                  })
                                }}
                              />
                            </div>

                            <div className="os-ui-form-group">
                              <label>Host</label>
                              <input
                                readOnly
                                type="text"
                                placeHolder="Host"
                                value={data["brand-domain"] || ""}
                                onChange={(ev)=>{
                                  this.setState({
                                    host:ev.target.value
                                  })
                                }}
                              />
                            </div>
                          </div>

                          <div className="os-ui-col">
                            <div className="os-ui-form-group">
                              <label>Device</label>
                              <input
                                readOnly
                                type="text"
                                placeHolder="Device"
                                value={data.deviceClass}
                                onChange={(ev)=>{
                                  this.setState({
                                    device:ev.target.value
                                  })
                                }}
                              />
                            </div>

                            <div className="os-ui-form-group">
                              <label style={{width:"100%"}}>Flows Supported By Handle</label>
                              <div className="os-ui-col">
                                <div className="os-ui-form-group">
                                  <label>Pin</label>
                                  <input
                                    onChange={()=>this.setState({isPin:!this.state.isPin})}
                                    type="checkbox"
                                    checked={this.state.isPin}
                                  />
                                </div>
                                <div className="os-ui-form-group">
                                  <label>MO</label>
                                  <input
                                    onChange={()=>this.setState({isMo:!this.state.isMo})}
                                    type="checkbox"
                                    checked={this.state.isMo}
                                  />
                                </div>
                                <div className="os-ui-form-group">
                                  <label>MO Redirect</label>
                                  <input
                                    onChange={()=>this.setState({isMoRedirect:!this.state.isMoRedirect})}
                                    type="checkbox"
                                    checked={this.state.isMoRedirect}
                                  />
                                </div>
                                <div className="os-ui-form-group">
                                  <label>OneClick</label>
                                  <input
                                    onChange={()=>this.setState({isOneClick:!this.state.isOneClick})}
                                    type="checkbox"
                                    checked={this.state.isOneClick}
                                  />
                                </div>
                                <div className="os-ui-form-group">
                                  <label>Click 2 SMS</label>
                                  <input
                                    onChange={()=>this.setState({isClick2SMS:!this.state.isClick2SMS})}
                                    type="checkbox"
                                    checked={this.state.isClick2SMS}
                                  />
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="os-ui-col">
                            <div className="os-ui-form-group">
                              <button onClick={()=>this.saveConfiguration()}>Save Configuration</button>
                            </div>
                          </div>
                        </div>
                      }
                      
                      </div>
                    }
                    

                    </div>
                    </Tab>
                    <Tab title="Multi-Flow Strategies">
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


          
          </div>
      </Grommet>
    );
  }
}



export default connect(
  state => ({
    handle: state.handle
  })
, {
    get_handle,
    save_scenario_configuration
  }
) (ViewComponent)
