import React, { Component } from "react";

export default ({id})=>{

  const links = [{
    name:"Manage Pages",
    link:"/ouisys-pages",
    id:"pages"
  },{
    name:"Manage Legal Text",
    link:"/ouisys-pages/legals",
    id:"legals"
  },{
    name:"Manage Campaigns",
    link:"/ouisys-pages/campaigns",
    id:"campaigns"
  }]
  return(
    <ul>
      {
        links.map((obj, index)=>{
          return(
            <li key={index}><a className={(obj.id === id) ? "active" : ""} href={obj.link} >{obj.name}</a></li>
          )
        })
      }
    </ul>
  )
}