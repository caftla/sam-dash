// @flow

import Offline from 'offline-plugin/runtime'
import React from 'react'
import { Provider } from 'react-redux'
import { render } from 'react-dom'
// import { BrowserRouter, Route } from 'react-router-dom'

import createHistory from 'history/createBrowserHistory'
import { Route } from 'react-router'

import { ConnectedRouter, routerReducer, routerMiddleware, push } from 'react-router-redux'
// import './index.styl'
import './index.styl'

const history = createHistory()


import { store } from './store'

import Home from './components/Home'
import Dashboard from './components/Dashboard'
import Filter_Section_Row from './components/filter_section_row'
import Filter_Page_Section_Row from './components/filter_page_section_row'
import Transactions from './components/transactions'
import ARPU_Long from './components/arpu_long'
import Weekly_Reports from './components/weekly_reports'
import Cohort from './components/cohort'
import Arpu from './components/arpu'
import ConvertingIPs from './components/converting_ips'
import MonthlyReports from './components/monthly_reports'
import DailyReportsArchive from './components/daily_reports_archive'
import { Body } from './components/Styled'
import { fromQueryString } from './helpers'

Offline.install()

const Redirect_Filter_Page_Section_Row = ({ match, history }) => {
  const { format: d3Format } = require('d3-format')
  const formatTimezone = d3Format("+.1f")
  const { params } = match
  const timezone = new Date().getTimezoneOffset() / -60
  history.push(`/filter_page_section_row/${formatTimezone(timezone)}/${params.date_from}/${params.date_to}/${params.filter}/${params.page}/${params.section}/${params.row}`)
  return <div>Redirecting ...</div>
}

const tokenFromURL = fromQueryString(window.location.search.substring(1))
if (typeof tokenFromURL.token !== 'undefined') {
  localStorage.setItem('token', tokenFromURL.token)
}

const token = localStorage.getItem('token')
const queryString = fromQueryString(window.location.search.substring(1))
if (!token && !queryString.login_redir) {
  const url = window.location.href
  const newUrl = '/?login_redir=' + encodeURIComponent(url)
  window.location = newUrl
}

function Wrap(WrappedComponent) {
  return class PP extends React.Component {
    constructor(props : Props) {
      super(props)
      this.state = {route: props.location.pathname.substring(1).split('/')[0]}

      this.unlisten = this.props.history.listen((location, action) => {
        this.setState({
          route: location.pathname.substring(1).split('/')[0]
        })
      });
    }
    
	handleToggle(){
	
			[...document.getElementsByClassName('main-left')].map(e => e.classList.toggle('show')),
			[...document.getElementsByClassName('main-right')].map(e => e.classList.toggle('expand'))
	
	}
	
	copyUrl(){
		var getURL = document.location.href	
			alert(getURL)
	}

    componentWillUnMount() {
      if(!!this.unlisten) {
        this.unlisten();
      }
    }
    render() {
      console.log('%%%% ', this.state.route)
      return <div id="main">

        <div id="header">
            
            <ul id="main-area">
            
              <li id="filter-menu" class="active" onClick={ () => {
                var filterMenu = document.getElementById("filter-menu"),
                  sidebar = document.getElementById("sidebar"),
                  container = document.getElementById("container"),
                  tabsMenu = document.getElementById("tabs-menu"),
                  tabsArea = document.getElementById("tabs-area");
                  
                  filterMenu.classList.toggle("active");
                  sidebar.classList.toggle("visible");
                  container.classList.toggle("default");
                  
              }}><span></span></li>
              
              <li id="sam-media-logo"><a href="/"></a></li>	
              
              <li id="tabs-menu" onClick={ () => {
                var filterMenu = document.getElementById("filter-menu"),
                  sidebar = document.getElementById("sidebar"),
                  container = document.getElementById("container"),
                  tabsMenu = document.getElementById("tabs-menu"),
                  tabsArea = document.getElementById("tabs-area");

                tabsMenu.classList.toggle("active");	
                tabsArea.classList.toggle("show"); 
              } }><span></span></li>
            
            </ul>
            
            <div id="tabs-area">
            
              <a href="/filter_page_section_row/" className={ this.state.route == 'filter_page_section_row' ? 'active' : ''  }>Standard</a>

              <a href="/weekly_reports/" className={ this.state.route == 'weekly_reports' ? 'active' : ''  }>Standard +</a>
              
              <a href="/converting_ips/" className={ this.state.route == 'converting_ips' ? 'active' : ''  }>Converting IPs</a>          

              <a href="/arpu_long/" className={ this.state.route == 'arpu_long' ? 'active' : ''  }>ARPU Cohorts</a>

              <a href="/transactions/" className={ this.state.route == 'transactions' ? 'active' : ''  }>Transactions</a>

              <a href="/monthly_reports/" className={ this.state.route == 'monthly_reports' ? 'active' : ''  }>Monthly Report</a>
            
            
            </div>
            
            <div id="bar"></div>
                    
        </div>	

        <WrappedComponent {...this.props} />

      </div>
    }
  }
}

const main_bottom = <Provider store={store}>
  <ConnectedRouter history={history}>
    <Body>
      <Route exact path="/" component={Wrap(Home)} />
      <Route exact path="/dashboard" component={Wrap(Dashboard)} />
      {/* <Route path="/filter_section_row/:date_from/:date_to/:filter/:section/:row" component={Filter_Section_Row} /> */}
      <Route path="/filter_page_section_row/:timezone/:date_from/:date_to/:filter/:page/:section/:row" component={Wrap(Filter_Page_Section_Row)} />
      <Route path="/filter_page_section_row" exact={true} component={Wrap(Filter_Page_Section_Row)} />
      <Route exact path="/filter_page_section_row/:date_from/:date_to/:filter/:page/:section/:row" component={Wrap(Redirect_Filter_Page_Section_Row)} />
      <Route path="/transactions/:timezone/:date_from/:date_to/:filter/:page/:section/:row" component={Wrap(Transactions)} />
      <Route path="/transactions" exact={true} component={Wrap(Transactions)} />

      <Route path="/arpu_long/:date_from/:date_to/:filter/:page/:section/:row" component={Wrap(ARPU_Long)} />
      <Route path="/arpu_long" exact={true} component={Wrap(ARPU_Long)} />

      <Route path="/weekly_reports/:date_from/:date_to/:filter/:page/:section/:row" component={Wrap(Weekly_Reports)} />
      <Route path="/weekly_reports" exact={true} component={Wrap(Weekly_Reports)} />

      <Route path="/cohort" exact={true} component={Wrap(Cohort)} />
      <Route path="/arpu" exact={true} component={Wrap(Arpu)} />      
      <Route path="/cohort/:date_from/:date_to/:filter" component={Wrap(Cohort)} />
      
      <Route path="/converting_ips/" exact={true} component={Wrap(ConvertingIPs)} />
      <Route path="/converting_ips/:date_from/:date_to/:filter" component={Wrap(ConvertingIPs)} />
      
      <Route path="/monthly_reports/" exact={true} component={Wrap(MonthlyReports)} />
      <Route path="/monthly_reports/:date_from/:date_to/:filter/:breakdown" component={Wrap(MonthlyReports)} />
      <Route path="/daily_reports_archive/:date_from" component={Wrap(DailyReportsArchive)} />
      <Route path="/hourly_reports_archive/:date_from" component={Wrap(DailyReportsArchive)} />
    </Body>
  </ConnectedRouter>
</Provider>


export const Root = (args) => {
  return main_bottom
}

window.store = store


if (!module.hot) render(<Root />, document.querySelector('react'))
