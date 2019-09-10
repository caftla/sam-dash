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
      showMore:{},
      editRestriction:null,
      editRestrictionVal:{},
      editComments:null,
      editCommentsVal:{},
      itemsToExport:[]
    
    }
    this._child = React.createRef();
  }
  export_to_excel = (e) => {
    e.preventDefault()
    const workbook = XLSX.utils.table_to_book(document.getElementById('export-table'), {cellHTML:true})
    const wopts = { bookType:'xlsx', bookSST:false, type:'binary' };
  
    const wbout = XLSX.write(workbook,wopts);
  
    const s2ab = (s) => {
      const buf = new ArrayBuffer(s.length);
      const view = new Uint8Array(buf);
      for (var i=0; i!=s.length; ++i) view[i] = s.charCodeAt(i) & 0xFF;
      return buf;
    }
  
    /* the saveAs call downloads a file on the local machine */
    saveAs(new Blob([s2ab(wbout)],{type:""}), `pages.xlsx`)
  }
  render(){

  console.log(this.state.editRestrictionVal)
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
        search: true,
        render:(datum)=>{
          return(
            <div>
              <strong>{datum.xcid}</strong>
              <br/>
              <input
                style={{width:"10px"}}
                onChange={()=>{
                  if(this.state.itemsToExport.find((obj)=>obj.xcid === datum.xcid)){
                    var a = this.state.itemsToExport.filter((obj)=>obj.xcid !== datum.xcid);
                    this.setState({
                      itemsToExport:a
                    })
                  }else{
                    var b = this.state.itemsToExport;
                    b.push(datum);
                    this.setState({
                      itemsToExport:b
                    })
                  }
                }}
                type="checkbox"
                checked={this.state.itemsToExport.find((obj)=>obj.xcid === datum.xcid) ? true : false}
              />

            </div>
          )
        }
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
            <div>
              <ScenarioCell
                data={datum}
                toggleShowMore={()=>this.setState({
                  showMore: this.state.showMore.hasOwnProperty("id") ? null: datum
                })}
              />

              <MultiFlowCell
                data={datum}
                toggleShowMore={()=>this.setState({
                  showMore: this.state.showMore.hasOwnProperty("id") ? null: datum
                })}
              />
            </div>
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
          `https://c1.ouisys.com/${datum.xcid}?offer={offer_id}` :  `https://c1.ouisys.com/${datum.xcid}${datum.manager_id ? "?manager=" + datum.manager_id : "" }`
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
        header: "Notes",
        sortable: true,
        render: (datum)=>{
          const isEditMode = (this.state.editComments === datum.xcid) ? true : false;
          return(
            <div>
              <strong>Comments</strong>
              <div style={{width:"100%", display:"flex", flexDirection:"row"}}>
                {
                  (datum.comments || isEditMode) && 
                  <textarea
                    className="ouisys-textarea"
                    onChange={(ev)=>this.setState({
                      editCommentsVal:{
                        key:"comments",
                        value:ev.target.value,
                        xcid:datum.xcid
                      }
                    })}
                    value={(this.state.editCommentsVal.xcid === datum.xcid) ? this.state.editCommentsVal.value : datum.comments}
                    disabled={!isEditMode}
                  />
                }
                {
                  isEditMode && 
                  <a
                    onClick={()=>{
                      if(this.state.editCommentsVal.hasOwnProperty("xcid") && this.state.editCommentsVal.xcid === datum.xcid){
                        this.props.update_campaign(this.state.editCommentsVal);
                        this.setState({editComments:null});
                        this.setState({editCommentsVal:{}});
                      }else{
                        this.setState({editComments:null});
                        this.setState({editCommentsVal:{}});
                      }
                    }}
                    className="ouisys-edit ouisys-check"
                  ><i className="fa fa-check"/>
                  </a>
                  ||
                  <a onClick={()=>this.setState({editComments:datum.xcid})} className="ouisys-edit"><i className="fa fa-pencil"/></a>
                }
              </div>
              {
                datum.restrictions &&
                <div>
                  <strong>Restrictions</strong>
                  <div>{datum.restrictions}</div>
                </div>
              }
            </div>
          )
        }
      },
      {
        property: "ca_date_created",
        header: "Others",
        sortable: true,
        render: datum =>{
          return(
            <div>
              <strong>Date:</strong>
              <div>{moment(datum.ca_date_created).format("MMM Do YY")}</div>
            
              <strong>Status: </strong>
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
            </div>
          )
        }
      }
    ];
    const { all_campaigns } = this.props;
    return(
        <div className="campaign-wrapper dataTableWrapper">
          {
            (all_campaigns.length > 0) &&
            <DataTable className="dataTable" onMore={()=>this.props.get_all_campaigns()} ref={this._child} className="dataTable"  a11yTitle="My campaigns" columns={columns} data={all_campaigns} />
          }
          {
            this.state.showMore.hasOwnProperty("id") &&
            <MoreStrategyInfo
              close={()=>this.setState({showMore:{}})}
              data={this.state.showMore}
            />
          }

          {
            <button
              onClick={this.export_to_excel}
              className="jumbo-btn"
              disabled={(this.state.itemsToExport.length > 0) ? false : true}
            >
              Export To Excel ({(this.state.itemsToExport.length > 0) ? this.state.itemsToExport.length : 0 })
              <br/>
              <span>Click on the checkboxes to select items to export</span>
            </button>
          }
          <table style={{visibilty:"hidden"}} id="export-table">
            <thead>
              <tr>
                <th>Page</th>
                <th>Country</th>
                <th>Affiliate ID</th>
                <th>Link</th>
              </tr>
            </thead>
            <tbody>
              {
                (this.state.itemsToExport.length > 0) &&  this.state.itemsToExport.map((obj, index)=>{
                  const url = (obj.affiliate_id === "FREE-ANY" || obj.affiliate_id === "FREE-POP") ? `https://c1.ouisys.com/${obj.xcid}?offer={offer_id}${datum.manager_id ? "?manager=" + datum.manager_id : "" }` :  `https://c1.ouisys.com/${obj.xcid}${datum.manager_id ? "?manager=" + datum.manager_id : "" }`
                  return(
                    <tr key={index}>
                      <td>{obj.page}</td>
                      <td>{obj.country.toUpperCase()}</td>
                      <td>{obj.affiliate_id}</td>
                      <td>{url}</td>
                    </tr>
                  )
                })
              }
            </tbody>
          </table>
        </div>

      )
  } 

}

export default CampaignTable;