import React, { Component } from "react";
import moment from "moment";
import { DataTable } from 'grommet';

//import "./PublishedPages.scss";


class LegalsTable extends Component {


  handleDelete(data){
    const result = confirm(`You are about to delete legal text ID: ${data.id}`);
    if (result == true) {
      this.props.delete_legal(data.id);
    } else {
      console.log("You pressed Cancel!");
    }
  }

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
            <div className="legals-actions-wrapper">
              <button onClick={()=>this.props.toggle_legal_modal({show:true, type:"edit", data:datum})}>Edit</button>
              <button onClick={()=>this.handleDelete(datum)} className="warning">Delete</button>
            </div>
          )
        }
      }
    ];
    const legals = Array.isArray(this.props.legals) ? this.props.legals : [];
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