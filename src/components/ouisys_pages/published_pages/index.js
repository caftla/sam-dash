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
        property: "strategy",
        header: "Strategy",
        search: true
      },
      {
        property: "scenarios_config",
        header: "Scenarios Config",
        search: true
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
        property: "sam_xcid_id",
        header: "Preview",
        search: false,
        sortable: false,
        render: datum =>
          <a href={`https://c1.ouisys.com/${datum.sam_xcid_id}`} target="_blank" className="link">{`https://c1.ouisys.com/${datum.sam_xcid_id}`}</a>,
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
            <DataTable className="dataTable"  a11yTitle="My campaigns" columns={columns} data={publishedPages} />
          }

 {
//             this.state.showMore &&
          
//             <Modal
//               custom={()=>{
//                 const { modalDetails } = this.state;
//                 const { page, env_dump, git_username, date_created} = modalDetails;
//                 return(
//                   <div>
//                     <h1>{page}</h1>
//                     <div className="os-ui-col">
//                       <div className="col"><strong>Date Uploaded:</strong></div>
//                       <div className="col">{moment(date_created).format("MMM Do YY")}</div>
//                     </div>
//                     <div className="os-ui-col">
//                       <div className="col"><strong>Designer:</strong></div>
//                       <div className="col">{git_username}</div>
//                     </div>
//                     {
//                       env_dump &&
//                       <div>
//                         <div className="os-ui-col">
//                           <div className="col"><strong>.Env dump:</strong></div>
//                         </div>
//                         <pre className="col" style={{backgroundColor:"#eee", padding:5}}>{JSON.stringify(JSON.parse(env_dump), undefined, 2)}</pre>
//                       </div>
//                     }
//                   </div>
//                 )}
//               }
//               close={()=>this.toggleShowMore({})}
//               customClass="pages-more"
//             />
         }
        </div>

      )
  } 

}

export default PublishedPages;