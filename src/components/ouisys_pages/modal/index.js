import React, { Component } from "react";

//import "./PublishedPages.scss";

class Modal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      value: '',
      copied: false,
    };
  }
  copy(text) {
    const  dummy = document.createElement("input");
      document.body.appendChild(dummy);
      dummy.setAttribute('value', text);
      dummy.select();
      document.execCommand("copy");
    this.setState({copied: true})
  }

  render(){
    const { country, page, scenario, xcid } = this.props.created_campaign || "";
    const modalTitle = this.props.title;
    
    const { source_id  } = this.props.created_campaign || "";
    const url = (source_id && source_id === 930 || source_id === 929) ? `http://c1.ouisys.com/${xcid}?offer={offer_id}` : `http://c1.ouisys.com/${xcid}`

    return (
      <div
        className="modal-wrapper"
      >
  
        <div className={`well ${this.props.customClass || ""}`}>
          {
            !this.props.custom &&
            <div>
              <h4>{modalTitle}</h4>
              <p><b>Country: </b> {country}</p>
              <p><b>Page: </b> {page}</p>
              <p><b>Scenario: </b> {scenario}</p>
              <p><b>Link: </b><a href={url} target="_blank">{url}</a></p>
              <div className="btns">
                <button className="btn btn-warning" onClick={()=>this.copy(url)}>Copy to clipboard</button>
                <button color="secondary" onClick={this.props.close}>Close</button>
              </div>
              <p>{this.state.copied ? <span style={{color: 'red'}}>Copied.</span> : null}</p>
            </div>
          }
          {
           this.props.custom && 
           <div>
              {this.props.custom()}
              <button color="secondary" onClick={this.props.close}>Close</button>
           </div>

          }
          
        </div>
      </div>
    )
  }
}

export default Modal;