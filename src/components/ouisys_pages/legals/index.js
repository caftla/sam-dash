import React, {Component } from 'react'
import { connect } from 'react-redux'
import { Route } from "react-router"
import { grommet } from "grommet/themes";
import { Grommet, Tabs, Tab, Box, ThemeContext} from "grommet";
import { deepMerge } from "grommet/utils";
import { css } from "styled-components";


import Loader from "../loader";
import LegalsModal from "./legals_modal";
import { get_legals, add_legals, toggle_legal_modal, update_legals, delete_legal} from '../../../actions'

import LegalsTable from "./legals_table"

import SubMenu from "../submenu"
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
    console.log("this.state.route ", this.props.legals )

    return (
      <Grommet theme={customTheme}>
          <div className="top-spacer">
            <div id="tabs-area">
              <SubMenu id="legals"/>
                <h1>Legal Text</h1>
                <button
                  className="warning"
                  onClick={()=>this.props.toggle_legal_modal({show:true, type:"add"})}
                >Add New</button>
                <LegalsTable
                  legals={this.props.legals}
                  toggle_legal_modal={this.props.toggle_legal_modal}
                  delete_legal={this.props.delete_legal}
                  
                />
              
            </div>
            {
              this.props.show_legal_modal.show &&
              <LegalsModal
                add_legals={this.props.add_legals}
                show_legal_modal={this.props.show_legal_modal}
                toggle_legal_modal={this.props.toggle_legal_modal}
                update_legals={this.props.update_legals}
                
              />
            }
          </div>
      </Grommet>
    );
  }
}



export default connect(
  state => ({
    legals: state.legals,
    is_loading: state.is_loading,
    show_legal_modal: state.show_legal_modal
      
  })
, {
    get_legals,
    add_legals,
    toggle_legal_modal,
    update_legals,
    delete_legal
  }
) (ViewComponent)
