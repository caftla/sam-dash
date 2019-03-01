import React, { Component } from "react";
import moment from "moment";
import { DataTable } from 'grommet';
//import "./PublishedPages.scss";


class PublishedPages extends Component {


  render(){
    const columns = [
      {
        property: "id",
        header: "ID",
        primary: true
      },{
        property: "page",
        header: "Page",
        primary: true,
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
        property: "html_url",
        header: "Url",
        search: true,
        sortable: true,
        render: datum =>
          <a href={datum.html_url} target="_blank" className="link">{datum.html_url}</a>,
      },
      {
        property: "username",
        header: "Publisher",
        search: true,
        sortable: true
      },
      {
        property: "date_created",
        header: "Date",
        sortable: true,
        primary: true,
        render: datum =>
          datum.date_created && moment(datum.date_created).format("MMM Do YY"),
        align: "end"
      }
    ];
    const { publishedPages } = this.props;
    return(
        <div>
          {
            (publishedPages.length > 0) &&
            <DataTable className="dataTable"  a11yTitle="My campaigns" size="large" columns={columns} data={publishedPages} />
          }
        </div>

      )
  } 

}

export default PublishedPages;