import React, { Component } from "react";
import {CopyToClipboard} from 'react-copy-to-clipboard';
import { Input, LabelledInput, InputSelect, InputMultiSelect } from '../../../common-controls/FormElementsUtils'
import { FormRow } from "../../../Styled";
import "./index.styl"
import moment from "moment"


//import "./PublishedPages.scss";

class CreateCampaign extends Component {
  constructor(props) {
    super(props);
    this.state = {
      value: '',
      copied: false,
      checked: {},
      affid:"",
      affids:[],
      comments:{},
      copied:{},
      multiInput:[]
    };
  }

  handleSubmit(ev){
    ev.preventDefault();
    this.props.create_multiple_campaigns(this.state.multiInput)
  }
  getInput(payload){
    const {key, value } = payload;
    this.setState({
      [key]:value
    })
  }
  getMultiInputInput(payload){
    const {affid, key, value, source_id } = payload;
    const { country, page, scenario } = this.props.show_create_campaign.data;
    this.setState({
      multiInput:{
        ...this.state.multiInput,
        [affid]:{
          [key]:value,
          country,
          page,
          scenario,
          affid,
          source_id
        } 
      }
    })
  }

  removeFromMultiInput(id){
    const newMultiInput = delete this.state.multiInput[id];
    this.setState({
      multiInput:this.state.multiInput
    })
  }
  render(){
    const { country, page, scenario } = this.props.show_create_campaign.data;
    const searched_campaigns = Array.isArray(this.props.searched_campaigns) ? this.props.searched_campaigns : [];
    //const url = `http://c1.ouisys.com/${xcid}`;
    return (
      <div className="modal-wrapper create-campaign-modal">
  
        <div className="well" style={{width:"100%"}}>
        <button
          className="os-ui-close-btn"
          onClick={()=>{
            this.props.toggle_create_campaign({});
            this.props.reset_existing_campaigns([]);
          }
        }>
          X
        </button>
          <h1>Create campaign</h1>
          <p><b>Country: </b> {country} <b>Page: </b> {page} <b>Scenario: </b> {scenario}</p>

          <form onSubmit={(ev)=>this.handleSubmit(ev)}>
            <div className="os-ui-form-group">
            <label>Source(s)</label>
            {
              (Array.isArray(this.props.sources) && this.props.sources.length > 0) &&
              <InputMultiSelect
                name="Source"
                showLabel
                onChange={ valString =>{
                  const affidsArr = valString.split(';');
                  const beautifulArr = [];

                  if(Array.isArray(affidsArr)){
                    affidsArr.forEach((element)=>{
                      beautifulArr.push(JSON.parse(element))
                    })
                  }
                  console.log("affidARR",beautifulArr)
                  const findCampaignsArr = beautifulArr.map(function(item) {
                    console.log("item", item)
                    return item["affiliate_id"];
                  });
                  this.props.find_campaigns({
                    page,
                    country,
                    affid:findCampaignsArr,
                    scenario
                  });
                  this.setState({
                    affids:beautifulArr
                  })
                  this.getInput({
                    key:"affid",
                    value:valString
                  }) 
                }
                }
                value={ this.state.affid }
                options={ this.props.sources.map(x => {

                  const obj = {
                    source_id:x.offer_id,
                    affiliate_id:x.affiliate_id
                  }
                  return({
                    name:(x.affiliate_name === null) ? `${x.affiliate_id} 🐳` :`${x.affiliate_id} (${x.affiliate_name} - ${x.offer_id})`,
                    value:JSON.stringify(obj)
                  })
                })} 
              />
            }
          


            </div>

            <div>
              {
                this.state.affids.map((obj, index)=>{
                  return(
                    <div className="card">
                      <div className="os-ui-form-group">
                        <h2>Campaign for {obj.affiliate_id}</h2>

                        {
                          (searched_campaigns.length > 0) && (searched_campaigns.filter((mObj)=>mObj.affiliate_id === obj.affiliate_id).length > 0) &&
                          <div>
                            <h6>Existing campaigns</h6>
                            <div className="existing_campaigns">
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
                                  searched_campaigns.map((tObj, index)=>{
                                    const url = (tObj.affiliate_id === "FREE-ANY" || tObj.affiliate_id === "FREE-POP") ? 
                                    `https://c1.ouisys.com/${tObj.xcid}?offer={offer_id}` :  `https://c1.ouisys.com/${tObj.xcid}`;
                                    if(obj.affiliate_id === tObj.affiliate_id){
                                      return (
                                          <tr>
                                            <td>
                                              {tObj.affiliate_id}
                                            </td>
                                            <td>
                                              <a href={url} target="_blank">{url}</a>
                                            </td>
                                            <td>
                                              {tObj.comments}
                                            </td>
                                            <td>
                                              {moment(tObj.date_created).format("MMM Do YY")}
                                            </td>
                                            <td>

                                            {this.state.copied[tObj.xcid] ? <span style={{color: 'red'}}>Copied.</span> : null}
                
                                            <CopyToClipboard text={url}
                                              onCopy={() => this.setState({
                                                copied:{
                                                  [tObj.xcid]: true
                                                }
                                              })}>
                                              <button type="button" className="btn btn-warning">Copy</button>
                                            </CopyToClipboard>
                                            </td>
                                          </tr>
                                      ) 
                                    }
                                  })
                                }
                              </tbody>
                              </table>
                            </div>
                          </div>
                        }
                        <FormRow>
                          <label style={{width: '100%'}}>
                            <input
                              onChange={ev =>{
                                this.setState({
                                  checked:{
                                    [obj.affiliate_id]: ev.target.checked
                                  }
                                })
                                console.log("ev.target.checked", ev.target.checked)
                                if(ev.target.checked === true){
                                  this.getMultiInputInput({
                                    affid:obj.affiliate_id,
                                    source_id:obj.source_id,
                                    key:"comments",
                                    value:this.state.comments[obj.affiliate_id] || ""
                                  })
                                }else{
                                  this.removeFromMultiInput(obj.affiliate_id)
                                }
                                

                              }}
                              style={{width: 'auto'}} type="checkbox" /> &nbsp; Create a new campaign for {obj.affiliate_id}
                          </label>
                        </FormRow>
                        <label>Comments</label>
                        <input
                          disabled={this.state.checked[obj.affiliate_id] ? false : true}
                          name="comments"
                          onChange={(ev)=>{
                              this.getInput({
                                key:"comments",
                                value:{
                                  [obj.affiliate_id]:ev.target.value
                                }
                              })
                              this.setState({
                                multiInput:{
                                  ...this.state.multiInput,
                                  [obj.affiliate_id]:{
                                    ...this.state.multiInput[obj.affiliate_id],
                                    comments:ev.target.value
                                  }
                                }
                              })
                            }
                          }
                        />
                      </div>
                      <hr/>
                    </div>
                  )
                })
              }
            </div>

            <button className="jumbo-btn">
              Create
            </button>
          </form>
        </div>
      </div>
    )
  }
}

export default CreateCampaign;