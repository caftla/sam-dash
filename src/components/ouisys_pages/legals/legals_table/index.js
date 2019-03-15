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
        search: false,
        sortable: false
      },
      {
        property: "language",
        header: "Language",
        search: false,
        sortable: false
      },
      {
        property: "top_legal",
        header: "Top legals",
        search: false,
        sortable: false
      },
      {
        property: "disclaimer",
        header: "Disclaimers",
        search: false,
        sortable: false
      },
      {
        property: "disclaimer",
        header: "Disclaimers",
        search: false,
        sortable: false
      },
      {
        property: "has_exit",
        header: "Has Exit",
        search: false,
        sortable: false
      },
      {
        property: "logo_url",
        header: "Logo",
        search: false,
        sortable: false
      },
      {
        property: "extra_image_url",
        header: "Extra Image",
        search: false,
        sortable: false
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
              <button>Edit</button>
            </div>
          )
        }
      }
    ];
    const { legals } = this.props;
    return(
        <div>
          {
            (legals.length > 0) &&
            <DataTable className="dataTable"  a11yTitle="My campaigns" columns={columns} data={legals} />
          }
        </div>

      )
  } 

}

export default LegalsTable;