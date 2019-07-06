import React, { Component } from "react";
import moment from "moment";
import { DataTable, Select } from 'grommet';
import { InputSelect } from '../../../common-controls/FormElementsUtils'
import MoreStrategyInfo from "../../more_strategy_info"
import MultiFlowCell from "../../multi_flow_cell"
import ScenarioCell from "../../scenario_cell"

//import "./PublishedPages.scss";


class CampaignTable extends Component {

  constructor(props){
    super(props)
    this.state = {
      httpStatusObj: {},
      showMore:{}
    
    }
    this._child = React.createRef();
  }
  render(){
    const campaignState = [{
      name:"Ok",
      value:"Ok"
    },{
      name:"Unpublished",
      value:"Gone"
    }]
    const columns = [
      {
        property: "xcid",
        header: "xcid",
        primary: true,
        search: true
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
        header: "Multi-Flow",
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
        render: datum =>
          datum.date_created && moment(datum.date_created).format("MMM Do YY"),
        align: "end"
      },
      {
        property: "",
        header: "Status",
        sortable: true,
        render: (datum)=>{
          return(
            <select
              id={datum.xcid}
              defaultValue={this.state.httpStatusObj[datum.xcid] || datum.http_status}
              onChange={(ev)=>{
                const result = confirm(`You are are about to change the status for => https://c1.ouisys.com/${datum.xcid} to: ${ev.target.value}`);
                if(result){
                  this.setState({
                    httpStatusObj:{
                      [datum.xcid]: ev.target.value,
                      ...this.state.httpStatusObj
                    }
                  })
                  this.props.update_campaign_status({
                    xcid:datum.xcid,
                    http_status:ev.target.value
                  })
                  this.props.get_all_campaigns();
                } else {
                  document.querySelector(`#${datum.xcid}`).value = (datum.http_status === null) ? "OK" :  datum.http_status;
                  //this.props.get_all_campaigns();
                  console.log("You pressed Cancel!", this.state.httpStatusObj);
                }
              }}
            >
              
              <option value="OK" selected={(datum.http_status === null || datum.http_status === "OK") ? true : false}>OK</option>
              <option value="Gone">Unpublished/Gone</option>
              <option value="Not Found">Not Found</option>
              <option value="Forbidden">Forbidden</option>
            </select>
          )
        },
        align: "end"
      }
    ];
    const { all_campaigns } = this.props;
    return(
        <div>
          {
            (all_campaigns.length > 0) &&
            <DataTable onMore={()=>this.props.get_all_campaigns()} ref={this._child} className="dataTable"  a11yTitle="My campaigns" columns={columns} data={all_campaigns} />
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