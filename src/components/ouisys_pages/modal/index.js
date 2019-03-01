import React, { Component } from "react";
import {CopyToClipboard} from 'react-copy-to-clipboard';

//import "./PublishedPages.scss";

class Modal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      value: '',
      copied: false,
    };
  }

  render(){
    const { country, page, scenario, xcid } = this.props.created_campaign;
    const url = `http://c1.ouisys.com/${xcid}`;
    return (
      <div className="modal-wrapper">
  
        <div className="well">
          <h5>Page published successfully:</h5>
          <p><b>Country: </b> {country}</p>
          <p><b>Page: </b> {page}</p>
          <p><b>Scenario: </b> {scenario}</p>
          <p><b>Link: </b><a href={url} target="_blank">{url}</a></p>
          <div className="btns">
            <CopyToClipboard text={`Country: ${country}, Page: ${page}, Scenario: ${scenario}, Link: ${url}`}
              onCopy={() => this.setState({copied: true})}>
              <button className="btn btn-warning">Copy to clipboard</button>
            </CopyToClipboard>
            <button color="secondary" onClick={()=>this.props.toggleShowLink(false)}>Close</button>
          </div>
          <p>{this.state.copied ? <span style={{color: 'red'}}>Copied.</span> : null}</p>
        </div>
      </div>
    )
  }
}

export default Modal;