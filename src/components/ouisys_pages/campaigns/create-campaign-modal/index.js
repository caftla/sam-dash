import React, { Component } from "react";
import {CopyToClipboard} from 'react-copy-to-clipboard';
import { Input, LabelledInput, InputSelect } from '../../../common-controls/FormElementsUtils'

//import "./PublishedPages.scss";

class CreateCampaign extends Component {
  constructor(props) {
    super(props);
    this.state = {
      value: '',
      copied: false,
      affid:"",
      comments:""

    };
  }

  handleSubmit(ev){
    ev.preventDefault();
    this.props.create_campaign({
      affid:this.state.affid,
      comments:this.state.comments,
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
    //const url = `http://c1.ouisys.com/${xcid}`;
    return (
      <div className="modal-wrapper">
  
        <div className="well">
        <button className="os-ui-close-btn" onClick={()=>this.props.toggle_create_campaign({})}>X</button>
          <h4>Create campaign</h4>
          <p><b>Country: </b> {country}</p>
          <p><b>Page: </b> {page}</p>
          <p><b>Scenario: </b> {scenario}</p>

          <form onSubmit={(ev)=>this.handleSubmit(ev)}>
            <div className="os-ui-form-group">
            <InputSelect
              name="Source"
              showLabel
              onChange={ affiliate_id =>this.getInput({
                key:"affid",
                value:affiliate_id
              }) }
              value={ this.state.affid }
              options={ this.props.sources.map(x => {
                return({
                  name:(x.affiliate_name === null) ? `${x.affiliate_id} 🐳` :`${x.affiliate_id}(${x.affiliate_name} - ${x.offer_id})`,
                  value:x.affiliate_id
                })
              })} 
            />
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
                <label>Comments*</label>
                <input
                  required
                  name="comments"
                  required
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
            <button>
              Create
            </button>
          </form>
        </div>
      </div>
    )
  }
}

export default CreateCampaign;