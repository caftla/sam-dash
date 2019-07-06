import React, { Component } from "react";
import moment from "moment";
import { DataTable } from 'grommet';

import MoreStrategyInfo from "../../more_strategy_info"
import MultiFlowCell from "../../multi_flow_cell"
import ScenarioCell from "../../scenario_cell"

//import "./PublishedPages.scss";


class CampaignTable extends Component {
  state = {
    showMore:{}
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
        property: "page",
        header: "Page",
        search: true,
        sortable: true
      },
      {
        property: "scenario",
        header: "Scenario",
        search: true,
        sortable: true,
        render: datum =>{
          return(
            <ScenarioCell
              data={datum}
              toggleShowMore={()=>this.setState({
                showMore: this.state.showMore.hasOwnProperty("id") ? null: datum
              })}
            />
          )
        }
      },
      {
        property: "env_dump",
        header: "Service",
        search: true,
        render: datum =>{
          const {service} = datum.env_dump ? JSON.parse(datum.env_dump) : {};
          return(
            <span>{service}</span>
          )
        }
      },
      {
        property: "strategy",
        header: "Strategy",
        search: true,
        render: datum =>{
          return(
            <MultiFlowCell
              data={datum}
              toggleShowMore={()=>this.setState({
                showMore: this.state.showMore.hasOwnProperty("id") ? null: datum
              })}
            />
          )
        }
      },
      // {
      //   property: "html_url",
      //   header: "Url",
      //   search: false,
      //   sortable: false,
      //   render: datum =>
      //     <a href={datum.html_url} target="_blank" className="link">{datum.html_url}</a>,
      // },
      {
        property: "sam_xcid_id",
        header: "Preview",
        search: false,
        sortable: false,
        render: datum =>
          <a href={`https://c1.ouisys.com/${datum.sam_xcid_id}`} target="_blank">{`https://c1.ouisys.com/${datum.sam_xcid_id}`}</a>,
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
      },
      {
        property: "",
        header: "Action",
        sortable: true,
        primary: true,
        render: datum =>{
          const { country, page, scenario, strategy, scenarios_config } = datum || "";
          const url = scenario ? 
          `https://sigma.sam-media.com/ouisys-pages/campaigns/?country=${country}&page=${page}&scenario=${scenario}`
          : `https://sigma.sam-media.com/ouisys-pages/campaigns/?country=${country}&page=${page}&strategy=${strategy}&scenarios_config=${scenarios_config}`;
          return(
            <div className="campaign-btns">
              <a href={url}>
              <button
                className="btn btn-success"
              >Create Campaign <i className="fa fa-pencil"></i></button>
              </a>
              <button
                className="btn btn-warning"
                onClick={()=>this.props.toggleShowShare({show:true, data:datum})}
              >Share Create Url <i className="fa fa-share-alt"></i></button>
            </div>
          )
        },
        align: "end"
      }
    ];
    const { publishedPages } = this.props;
    return(
        <div>
          {
            (publishedPages.length > 0) &&
            <DataTable className="dataTable"  a11yTitle="My campaigns" columns={columns} data={publishedPages} />
          }
          {
            this.state.showMore.hasOwnProperty("id") &&
            <MoreStrategyInfo
              close={()=>this.setState({showMore:{}})}
              data={this.state.showMore}
            />
          }
        </div>

      )
  } 

}

export default CampaignTable;