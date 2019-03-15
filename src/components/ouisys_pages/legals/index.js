import React, {Component } from 'react'
import { connect } from 'react-redux'
import { Route } from "react-router"
import { grommet } from "grommet/themes";
import { Grommet, Tabs, Tab, Box, ThemeContext} from "grommet";
import { deepMerge } from "grommet/utils";
import { css } from "styled-components";


import Loader from "../loader";
import Modal from "../modal";
import { get_legals } from '../../../actions'

import LegalsTable from "./legals_table"
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
    this.state = {route: props.location.pathname.substring(1).split('/')[0]}
  }
  componentWillMount() {
    this.props.get_legals();
  }


  render() {
    console.log("this.state.route ", this.state.route )

    return (
      <Grommet theme={customTheme}>
          <div className="top-spacer">
          
            <div id="tabs-area">
              <ul>
                <li><a  href={`/ouisys-pages/publishing` } >Manage Pages</a></li>
                <li><a className="active" href={`/ouisys-pages/legals` } >Manage Legal Text</a></li>
                <li>Add</li>
              </ul>
              <LegalsTable legals={this.props.legals}/>

            </div>

          </div>
      </Grommet>
    );
  }
}



export default connect(
  state => ({
    legals: state.legals,
    is_loading: state.is_loading
      
  })
, {
    get_legals
  }
) (ViewComponent)
