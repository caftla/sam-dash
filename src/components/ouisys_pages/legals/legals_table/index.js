import React, { Component } from "react";
import moment from "moment";
import { DataTable } from 'grommet';
//import "./PublishedPages.scss";


class LegalsTable extends Component {


  render(){
    const columns = [
      {
        property: "id",
        header: "ID",
        primary: true
      },{
        property: "country",
        header: "Country",
        search: true,
        sortable: true
      },
      {
        property: "scenario",
        header: "Scenario",
        search: true,
        sortable: true
      },
      {
        property: "service",
        header: "Service",
        search: true,
        sortable: false
      },
      {
        property: "language",
        header: "Language",
        search: true,
        sortable: false
      },
      {
        property: "top_legal",
        header: "Top legals",
        sortable: false,
        render: datum =>{
          return(
            <div className="large-text">
              {datum.top_legal}
            </div>
          )
        }
      },
      {
        property: "disclaimer",
        header: "Disclaimers",
        sortable: false,
        render: datum =>{
          return(
            <div className="large-text">
              {datum.disclaimer}
            </div>
          )
        }
          
      },
      {
        property: "price_point",
        header: "Price Points",
        sortable: false,
        render: datum =>{
          return(
            <div className="large-text">
              {datum.price_point}
            </div>
          )
        }
      },
      {
        property: "",
        header: "Extras",
        search: false,
        sortable: false,
        render: datum =>{
          return(
            <div>
              <bold>Logo:</bold> <img width="50" src={datum.logo_url}/> <br/>
              <bold>Extra Image: </bold><img src={datum.extra_image_url}/><br/>
              <bold>Exit: </bold>{datum.has_exit ? "TRUE" : "FALSE"}
            </div>
          )
        }
      },
      {
        property: "date_created",
        header: "Date",
        sortable: true,
        primary: true,
        render: datum =>
          datum.date_created && moment(datum.date_created).format("MMM Do YY"),
        align: "end"
      },
      {
        property: "",
        header: "Action",
        search: false,
        sortable: false,
        render: datum =>{
          return(
            <div>
              <button onClick={()=>this.props.toggle_legal_modal({show:true, type:"edit", data:datum})}>Edit</button>
            </div>
          )
        }
      }
    ];
    const legals = Array.isArray(this.props.legals) ? this.props.legals : [];
    console.log("legals", legals)
    return(
        <div>
          {
            true &&
            <DataTable  a11yTitle="My campaigns" columns={columns} data={legals} />
          }
        </div>

      )
  } 

}

export default LegalsTable;