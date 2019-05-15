import React, { Component } from "react";
import {CopyToClipboard} from 'react-copy-to-clipboard';
import { Input } from "../../../common-controls/FormElementsUtils";
import { Heading } from "grommet";

//import "./PublishedPages.scss";


class LegalsModal extends Component {
  constructor(props){
    super(props)
    this.state = {
      country:"",
      scenario:"",
      service:"",
      language:"",
      top_legal:"",
      price_point:"",
      disclaimer:"",
      extra_disclaimer:"",
      has_exit:false,
      logo_url:"",
      extra_image_url:""
      

    }
  }

  componentDidMount(){
    if(this.props.show_legal_modal.type === "edit"){
      this.setState({...this.props.show_legal_modal.data})
    }
  }

  // jsonFriendly(text){
  //   var newTxt = text.replace(/</g,"&lt;").replace(/>/g,"&gt;");
  //   return newTxt.replace(/(\r\n|\n|\r)/gm, "");
  // }

  handleSubmit(ev){
    ev.preventDefault();
    const objectToSend = {
      country:this.state.country.toLowerCase(),
      scenario:this.state.scenario.toLowerCase(),
      service:this.state.service.toLowerCase(),
      language:this.state.language.toLowerCase(),
      top_legal:this.state.top_legal,
      price_point:this.state.price_point,
      disclaimer:this.state.disclaimer,
      extra_disclaimer:this.state.extra_disclaimer
    };

    if(this.props.show_legal_modal.type !== "edit"){
      this.props.add_legals(objectToSend)
    }else{
      this.props.update_legals({id:this.props.show_legal_modal.data.id,...objectToSend})
    }

  }
  render(){
    const {
      country,
      scenario,
      service,
      language,
      top_legal,
      price_point,
      disclaimer,
      extra_disclaimer
    } = this.state;
    const { } = this.props.show_legal_modal
    return (
      <div className="modal-wrapper">
        <div className="legals-well">
          <form className="legal-form-wrapper" onSubmit={(ev)=>this.handleSubmit(ev)}>
          <h4>Add Legals</h4>
            <div className="os-ui-col">
              <div className="os-ui-form-group">
                <label>Country*</label>
                <input
                  value={country}
                  name="country"
                  required
                  onChange={(ev)=>{
                    this.setState({
                      country:ev.target.value
                      
                    })
                  }}
                  placeHolder="For example ae"
                />
              </div>
              <div className="os-ui-form-group">
                <label>Scenario*</label>
                <input
                  value={scenario}
                  name="scenario"
                  required
                  onChange={(ev)=>{
                    this.setState({
                      scenario:ev.target.value                   
                    })
                  }}
                  placeHolder="For example ae-actel-ouisys-handle"
                />
              </div>
            </div>
            <div className="os-ui-col">
              <div className="os-ui-form-group">
                <label>Service*</label>
                <input
                  value={service}
                  name="service"
                  required
                  onChange={(ev)=>{
                    this.setState({
                      service:ev.target.value     
                    })
                  }}
                  placeHolder="For example buz2mobile"
                />
              </div>
              <div className="os-ui-form-group">
                <label>Language*</label>
                <input
                  value={language}
                  name="language"
                  required
                  onChange={(ev)=>{
                    this.setState({
                      language:ev.target.value
                      
                    })
                  }}
                  placeHolder="For example ar"
                />
              </div>
            </div>
            <div className="os-ui-form-group">
              <label>Top Legals</label>
              <textarea
                value={top_legal}
                name="top_legal"
                onChange={(ev)=>{
                  this.setState({
                    top_legal:ev.target.value
                    
                  })
                }}
                placeHolder="Legal text which normally appears at the top of the page"
              >{top_legal}</textarea>
            </div>
            <div className="os-ui-form-group">
              <label>Disclaimers</label>
              <textarea
                value={disclaimer}
                name="disclaimer"
                onChange={(ev)=>{
                  this.setState({
                    disclaimer:ev.target.value
                    
                  })
                }}
                placeHolder="Legal text which normally appears at the bottom of the page"
              />
            </div>
            <div className="os-ui-form-group">
              <label>Price Points</label>
              <textarea
                value={price_point}
                name="price_point"
                onChange={(ev)=>{
                  this.setState({
                     price_point:ev.target.value
                    
                  })
                }}
                placeHolder="Price point text which normally appears under a button"
              />
            </div>
            <div className="os-ui-form-group">
              <label>Extra Disclaimer(optional)</label>
              <textarea
                value={extra_disclaimer}
                name="price_point"
                onChange={(ev)=>{
                  this.setState({
                    extra_disclaimer:ev.target.value
                    
                  })
                }}
                placeHolder="Optional e.g on modal"
              />
            </div>

            
            <div className="os-ui-col">
              <div className="os-ui-form-group">
                <button color="secondary">Save</button>
              </div>
              <div className="os-ui-form-group">
                <button color="warning" onClick={()=>this.props.toggle_legal_modal({})}>Close</button>
              </div>
            </div>
          </form>
        </div>
      </div>
    )
  }
}

export default LegalsModal;