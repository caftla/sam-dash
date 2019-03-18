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
      has_exit:this.state.has_exit,
      logo_url:this.state.logo_url,
      extra_image_url:this.state.extra_image_url
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
      has_exit,
      logo_url,
      extra_image_url
    } = this.state;
    const { } = this.props.show_legal_modal
    return (
      <div className="modal-wrapper">
  
        <div className="legals-well">
          

          <form className="legal-form-wrapper" onSubmit={(ev)=>this.handleSubmit(ev)}>
          <h4>Add Legals</h4>
            <div className="legals-col">
              <div className="legal-form-group">
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
                />
              </div>
              <div className="legal-form-group">
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
                />
              </div>
            </div>
            <div className="legals-col">
              <div className="legal-form-group">
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
                />
              </div>
              <div className="legal-form-group">
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
                />
              </div>
            </div>
            <div className="legal-form-group">
              <label>Top Legals</label>
              <textarea
                value={top_legal}
                name="top_legal"
                onChange={(ev)=>{
                  this.setState({
                    top_legal:ev.target.value
                    
                  })
                }}
              >{top_legal}</textarea>
            </div>
            <div className="legal-form-group">
              <label>Disclaimers</label>
              <textarea
                value={disclaimer}
                name="disclaimer"
                onChange={(ev)=>{
                  this.setState({
                    disclaimer:ev.target.value
                    
                  })
                }}
              />
            </div>
            <div className="legal-form-group">
              <label>Price Points</label>
              <textarea
                value={price_point}
                name="price_point"
                onChange={(ev)=>{
                  this.setState({
                     price_point:ev.target.value
                    
                  })
                }}
              />
            </div>
            <div className="legal-form-group">
              <label>Has exit button (optional)</label>
              <select
                onChange={(ev)=>{
                  this.setState({
                    has_exit:ev.target.value
                  
                  })
                }}
                value={has_exit}
              >
                <option value={false}>False</option>
                <option value={true}>True</option>
              </select>
            </div>
            <div className="legals-col">
              <div className="legal-form-group">
                <label>Logo url (optional)</label>
                <input
                  value={logo_url}
                  name="logo_url"
                  onChange={(ev)=>{
                    this.setState({
                      logo_url:ev.target.value
                    })
                  }}
                />
              </div>
              <div className="legal-form-group">
                <label>Extra Image url (optional)</label>
                <input
                  value={extra_image_url}
                  name="extra_image_url"
                  onChange={(ev)=>{
                    this.setState({
                      extra_image_url:ev.target.value
                    })
                  }}
                />
              </div>
            </div>
            <div className="legals-col">
              <div className="legal-form-group">
                <button color="secondary">Save</button>
              </div>
              <div className="legal-form-group">
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