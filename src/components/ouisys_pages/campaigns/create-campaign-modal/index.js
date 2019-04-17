import React, { Component } from "react";
import {CopyToClipboard} from 'react-copy-to-clipboard';
import { Input, LabelledInput, InputSelect } from '../../../common-controls/FormElementsUtils'
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
      dontReUse: false,
      affid:"",
      comments:"",
      copied:{}
    };
  }

  handleSubmit(ev){
    ev.preventDefault();
    this.props.create_campaign({
      affid:this.state.affid,
      comments:this.state.comments,
      dontReUse:this.state.dontReUse,
      ...this.props.show_create_campaign.data,
    })
  }
  getInput(payload){
    const {key, value } = payload;
    this.setState({
      [key]:value
    })
  }
  render(){
    const { country, page, scenario } = this.props.show_create_campaign.data;
    const searched_campaigns = Array.isArray(this.props.searched_campaigns) ? this.props.searched_campaigns : [];
    //const url = `http://c1.ouisys.com/${xcid}`;
    return (
      <div className="modal-wrapper create-campaign-modal">
  
        <div className="well">
        <button
          className="os-ui-close-btn"
          onClick={()=>{
            this.props.toggle_create_campaign({});
            this.props.reset_existing_campaigns([]);
          }
        }>
          X
        </button>
          <h4>Create campaign</h4>
          <p><b>Country: </b> {country}</p>
          <p><b>Page: </b> {page}</p>
          <p><b>Scenario: </b> {scenario}</p>

          <form onSubmit={(ev)=>this.handleSubmit(ev)}>
            <div className="os-ui-form-group">
            <InputSelect
              name="Source"
              showLabel
              onChange={ affiliate_id =>{
                this.props.find_campaigns({
                  page,
                  country,
                  affid:affiliate_id,
                  scenario
                });
                this.getInput({
                  key:"affid",
                  value:affiliate_id
                }) }
              }
              value={ this.state.affid }
              options={ this.props.sources.map(x => {
                return({
                  name:(x.affiliate_name === null) ? `${x.affiliate_id} 🐳` :`${x.affiliate_id} (${x.affiliate_name} - ${x.offer_id})`,
                  value:x.affiliate_id
                })
              })} 
            />

            {
              (searched_campaigns.length > 0) &&
              <div>
                <h6>Existing campaigns</h6>
                <div className="existing_campaigns">
                  <table>
                  <thead>
                    <tr>
                      <th>Link</th>
                      <th>Date</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                  {
                      searched_campaigns.reverse().map((obj, index)=>{
                        const url = (obj.affiliate_id === "FREE-ANY" || obj.affiliate_id === "FREE-POP") ? 
                        `https://c1.ouisys.com/${obj.xcid}?offer={offer_id}` :  `https://c1.ouisys.com/${obj.xcid}`;
                        return (
                            <tr>
                              <td>
                                <a href={url} target="_blank">{url}</a>
                              </td>
                              <td>
                                {moment(obj.date_created).format("MMM Do YY")}
                              </td>
                              <td>

                              {this.state.copied[obj.xcid] ? <span style={{color: 'red'}}>Copied.</span> : null}
  
                              <CopyToClipboard text={url}
                                onCopy={() => this.setState({
                                  copied:{
                                    [obj.xcid]: true
                                  }
                                })}>
                                <button type="button" className="btn btn-warning">Copy</button>
                              </CopyToClipboard>
                              </td>
                            </tr>
                        )
                      })
                    }
                  </tbody>
                  </table>
                </div>
              </div>
            }
{/* 
              <select
                required
                onChange={
                  (ev)=>this.getInput({
                    key:"affid",
                    value:ev.target.value
                  })
                }
              >
                <option value="">--Select--</option>
                <option value="FREE-ANY">Free Any</option>
                <option value="FREE-POP">Free POP</option>
                {
                  this.props.sources.map((obj, index)=>{
                    return (
                      <option value={obj.affiliate_id}>{obj.affiliate_name}</option>
                    )
                  })
                }
              </select> */}
            </div>
            <div className="os-ui-form-group">
                <label>Comments</label>
                <input
                  name="comments"
                  onChange={
                    (ev)=>this.getInput({
                      key:"comments",
                      value:ev.target.value
                    })
                  }
                />
              </div>
            {/* <div className="btns">
              <CopyToClipboard text={`Country: ${country}, Page: ${page}, Scenario: ${scenario}, Link: ${url}`}
                onCopy={() => this.setState({copied: true})}>
                <button className="btn btn-warning">Copy to clipboard</button>
              </CopyToClipboard>
              <button color="secondary" onClick={()=>this.props.toggleShowLink(false)}>Close</button>
            </div>
            <p>{this.state.copied ? <span style={{color: 'red'}}>Copied.</span> : null}</p> */}
            <FormRow>
              <label style={{width: '100%'}}>
                <input required value={this.state.dontReUse} onChange={ev => this.setState({dontReUse: ev.target.value})} style={{width: 'auto'}} type="checkbox" /> &nbsp; Create a new campaign
              </label>
            </FormRow>
            <button disabled={(searched_campaigns.length > 0 && !this.state.dontReUse) ? true : false}>
              Create
            </button>
          </form>
        </div>
      </div>
    )
  }
}

export default CreateCampaign;