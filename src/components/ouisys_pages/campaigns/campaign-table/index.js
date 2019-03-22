import React, { Component } from "react";
import moment from "moment";
import { DataTable } from 'grommet';
//import "./PublishedPages.scss";


class CampaignTable extends Component {


  render(){
    const columns = [
      {
        property: "xcid",
        header: "xcid",
        primary: true
      },{
        property: "country",
        header: "Country",
        search: true,
        sortable: true
      },
      {
        property: "page",
        header: "Page",
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
        search: false,
        sortable: false,
        render: datum =>
          <a href={datum.html_url} target="_blank" className="link">{datum.html_url}</a>,
      },
      {
        property: "xcid",
        header: "Preview",
        search: false,
        sortable: false,
        render: datum =>{
          const url = (datum.affiliate_id === "FREE-ANY" || datum.affiliate_id === "FREE-POP") ? 
          `https://c1.ouisys.com/${datum.xcid}?offer={offer_id}` :  `https://c1.ouisys.com/${datum.xcid}`
          return <a href={url} target="_blank" className="link">{url}</a>
        }
      },
      {
        property: "affiliate_id",
        header: "Affiliate id",
        search: true,
        sortable: true
      },
      {
        property: "affiliate_name",
        header: "Affiliate Name",
        search: true,
        sortable: true
      },
      {
        property: "comments",
        header: "Comments",
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
    const { all_campaigns } = this.props;
    return(
        <div>
          {
            (all_campaigns.length > 0) &&
            <DataTable className="dataTable"  a11yTitle="My campaigns" columns={columns} data={all_campaigns} />
          }
        </div>

      )
  } 

}

export default CampaignTable;