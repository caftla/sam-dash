import React, { Component } from "react";
import moment from "moment";
import { DataTable } from 'grommet';
import MoreStrategyInfo from "../more_strategy_info"
import MultiFlowCell from "../multi_flow_cell"
import ScenarioCell from "../scenario_cell"
//import "./UploadedPages.scss";


class UploadedPages extends Component {

  state = {
    showMore:{}
  }

  render(){
    const columns = [
      {
        property: "id",
        header: "ID",
        primary: true
      },
      {
        property: "page",
        header: "Page",
        search: true,
        sortable: true
      },
      {
        property: "country",
        header: "Country",
        search: true,
        sortable: true,
        render: datum =>
          datum.country.toUpperCase(),
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
      {
        property: "html_url",
        header: "Url",
        search: true,
        sortable: true,
        render: datum =>
          <a href={datum.html_url} target="_blank" className="link">{datum.html_url}</a>,
      },
      {
        property: "git_username",
        header: "Designer",
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
        render: datum =>
          <button className="btn btn-success" onClick={()=>this.props.publishPage({
            html_url:`https://s3.eu-central-1.amazonaws.com/mobirun/os-ui/static/${datum.page}/html/${datum.country}-${datum.scenario}-production.html`,
            page_upload_id:datum.id,
            username:datum.git_username,
            page:datum.page,
            country:datum.country,
            scenario:datum.scenario,
            strategy:datum.strategy,
            scenarios_config:datum.scenarios_config,
            comments:"page publish",
            affid:"SAM"
          })}>Publish</button>,
        align: "end"
      }
    ];
    const { uploadedPages } = this.props;
    return(
        <div>
          {
            (uploadedPages.length > 0) &&
            <DataTable  className="dataTable"   a11yTitle="My campaigns" columns={columns} data={uploadedPages} />
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

export default UploadedPages;




