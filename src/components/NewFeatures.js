import React from 'react'

export function setCookie(cname, cvalue, exdays) {
    var d = new Date();
    d.setTime(d.getTime() + (exdays*24*60*60*1000));
    var expires = "expires="+ d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
  }
  
 export function getCookie(cname) {
    var name = cname + "=";
    var decodedCookie = decodeURIComponent(document.cookie);
    var ca = decodedCookie.split(';');
    for(var i = 0; i <ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
  }
  
  
export class NewFeatures extends React.Component {
    render() {
      setCookie('announce', false, 9999)
      return <div className={'newFeature'} style={{ display: 'block', color: 'white', height: '100%', width: '100%', zIndex: '3', background: 'rgba(0,0,0, 0.8)', position: 'fixed', top: '60px', left: '0', overflowX: 'hidden' }}>
        <div style={{ position: 'fixed', top: '20%', left: '20%'}}>
          { this.props.children }
        </div>
      </div>
    }
  }
