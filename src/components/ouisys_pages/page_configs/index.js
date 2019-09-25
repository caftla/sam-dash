import React, {Component } from 'react'
import { connect } from 'react-redux'
import { Route } from "react-router"
import { grommet } from "grommet/themes";

import { Grommet, DataTable, Tabs, Tab, Box, ThemeContext} from "grommet";
import { deepMerge } from "grommet/utils";
import { css } from "styled-components";
import {CopyToClipboard} from 'react-copy-to-clipboard';


import Loader from "../loader";
import Modal from "../modal";
import SubMenu from "../submenu"
import moment from "moment"
import {
  get_handle,
  save_scenario_configuration,
  get_scenarios
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
      bupperUrl:null,
      isPin:false,
      isMo:false,
      isMoRedirect:false,
      isOneClick:false,
      isClick2SMS:false,
      editMode:false
    }
  }
  componentWillMount() {
    this.props.get_scenarios();
    this.bupperLogin();
    console.log("this.props.scenarios", this.props.scenarios)

  }


  async bupperLogin(ev){
    if(!!ev){
      ev.preventDefault();
    }
    const bupperUsername = localStorage.getItem("bupperUsername");
    const bupperPassword = localStorage.getItem("bupperPassword");

    const username = bupperUsername != null ? bupperUsername : this.state.username;
    const password = bupperPassword != null ? bupperPassword : this.state.password;

    if(username != null || password != null){
      try{
        const response = await fetch(`https://bupper.sam-media.com/api/resources/login?username=${username.replace(/@[^@]+$/, '')}&password=${encodeURIComponent(password)}`,
          {
            method: 'POST'
          }
        );
        const bupperUser = await response.json();
        if(bupperUser && bupperUser.accessToken){
          this.setState({isBupperAuth:true});
          const bupperUsername = localStorage.setItem("bupperUsername", username.replace(/@[^@]+$/, ''));
          const bupperPassword = localStorage.setItem("bupperPassword", password);
          localStorage.setItem("bpAccessToken", bupperUser.accessToken);
          this.setState({showLogin:false});
        }
      }catch(err){
        localStorage.removeItem("bupperUsername");
        localStorage.removeItem("bupperPassword");
        localStorage.removeItem("bpAccessToken");
        this.setState({showLogin:true, editMode:true});
        alert("Bupper Login Error. Wrong Username or Password. Please Try Again!");
        throw err;
      }
    }else{
      this.setState({showLogin:true, editMode:true});
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
    const columns = [
      {
        property: "id",
        header: "ID",
        primary: true
      },{
        property: "country",
        header: "Country",
        search: true,
        sortable: true
      },
      {
        property: "scenario",
        header: "Scenario",
        search: true,
        sortable: true
      },
      {
        property: "service",
        header: "Service",
        search: true,
        sortable: true

      },
      {
        property: "device",
        header: "Device",
        search: false,
        sortable: false
      },
      {
        property: "client",
        header: "Client",
        search: true,
        sortable: true
      },
      {
        property: "automatically_submit_all_operators",
        header: "Auto Operator Submit",
        search: true,
        sortable: true,
        render: datum =>{
          return(
            <div>
              {
                datum.automatically_submit_all_operators != null ?
               datum.automatically_submit_all_operators ? "true" : "false"
               :
               "false"
              }
            </div>
          )
        }
      },
      {
        property: "date_created",
        header: "Date Created",
        sortable: true,
        render: datum =>{
          return(
            <div>
              {moment(datum.date_created).format("MMM Do YY")}
            </div>
          )
        }
      }
    ];
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
                  {
                    (this.props.scenarios.length > 0) && !this.state.editMode &&
                    <DataTable className="dataTable"  a11yTitle="Scenarios" columns={columns} data={this.props.scenarios || []} />
                      ||
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
                            </div>
                            <div className="os-ui-form-group">
                              <button>Login</button>
                            </div>
                          </form>
                          ||
                          <div>
                            <div className="os-ui-col">
                              <div className="os-ui-form-group">
                                <h1>Paste Bupper handle url</h1>
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
                                  <button disabled={this.state.bupperUrl == null ? true : false} onClick={()=>this.extractBupperUrl()}>Go!</button>
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
                                  <label style={{width:"100%"}}>Confirm Flow(s) Supported By Handle</label>
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
                              {/* <div className="os-ui-col">
                                <div className="os-ui-form-group">
                                  <label style={{width:"100%"}}>Operators Supported</label>
                                  <div className="os-ui-col">
                                    <input type="text" multiple/>
                                  </div>
                                </div>
                              </div> */}

                              <div className="os-ui-col">
                                <div className="os-ui-form-group">
                                <button
                                  className="jumbo-btn btn-info"
                                  onClick={()=>this.saveConfiguration()}
                                >
                                  Confirm & Save Configuration
                                </button>
                                </div>
                              </div>
                            </div>
                          }
                          
                          </div>
                        }
                      </div>
                    }
                      {
                        !this.state.editMode &&
                        <button
                          className="jumbo-btn"
                          onClick={()=>this.setState({editMode:true})}
                        >
                          Add New Scenario
                        </button>
                      }
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
                      <h1>In Progress</h1>
 
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



            

          
          </div>
      </Grommet>
    );
  }
}



export default connect(
  state => ({
    handle: state.handle,
    is_loading: typeof state.is_loading != "function" ? state.is_loading : false,
    scenarios: typeof state.scenarios != "function" ? state.scenarios : []
  })
, {
    get_handle,
    save_scenario_configuration,
    get_scenarios
  }
) (ViewComponent)
