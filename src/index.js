// @flow

import Offline from 'offline-plugin/runtime'
import React from 'react'
import { Provider } from 'react-redux'
import { render } from 'react-dom'
// import { BrowserRouter, Route } from 'react-router-dom'

import createHistory from 'history/createBrowserHistory'
import { Route } from 'react-router'

import { ConnectedRouter, routerReducer, routerMiddleware, push } from 'react-router-redux'
import './index.styl'

const history = createHistory()


import { store } from './store'

import Home from './components/Home'
import Dashboard from './components/Dashboard'
import Filter_Section_Row from './components/filter_section_row'
import Filter_Page_Section_Row from './components/filter_page_section_row'
import Cohort from './components/cohort'
import ConvertingIPs from './components/converting_ips'
import MonthlyReports from './components/monthly_reports'
import DailyReportsArchive from './components/daily_reports_archive'
import { Body } from './components/Styled'
import { fromQueryString } from './helpers'

Offline.install()

const Redirect_Filter_Page_Section_Row = ({match, history}) => {
  const { format : d3Format } = require('d3-format')
  const formatTimezone = d3Format("+.1f")
  const {params} = match
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

const main_bottom = <Provider store={store}>
    <ConnectedRouter history={history}>
      <Body>
        <Route exact path="/" component={Home} />
        <Route exact path="/dashboard" component={Dashboard} />
        {/* <Route path="/filter_section_row/:date_from/:date_to/:filter/:section/:row" component={Filter_Section_Row} /> */}
        <Route path="/filter_page_section_row/:timezone/:date_from/:date_to/:filter/:page/:section/:row" component={Filter_Page_Section_Row} />
        <Route path="/filter_page_section_row" exact={ true } component={Filter_Page_Section_Row} />
        <Route exact path="/filter_page_section_row/:date_from/:date_to/:filter/:page/:section/:row" component={Redirect_Filter_Page_Section_Row} />
        <Route path="/cohort/:date_from/:date_to/:filter" component={Cohort} />
        <Route path="/converting_ips/:date_from/:date_to/:filter" component={ConvertingIPs} />
        <Route path="/monthly_reports/:date_from/:date_to/:filter" component={MonthlyReports} />
        <Route path="/daily_reports_archive/:date_from" component={DailyReportsArchive} />
      </Body>
    </ConnectedRouter>
  </Provider>


export const Root = (args) => {
  return <div id="main">
    <div id="main-top">
      <div className="main-left">
      		
      		<img src="/logo.png" alt="Sam Media"/>
      
      </div>
      <div className="main-right">
      		
      		<div className="menu-area">
      			
				<div className="tabs">
	      			<a onClick={ () => {
                  history.push(`/filter_page_section_row/`)
                }}>Standard</a>
	      			<a href="#">Converting IPs</a>
	      			<a href="#">Cohort</a>
	      			<a href="#">Monthly Report</a>
      			</div>
      			
      			<div className="actions">
					<a href="#">Export</a>
					<a href="#">Share Link</a>
      			</div>
      			
      		</div>
      
      </div>
    </div>
    {main_bottom}
  </div>
}


if (!module.hot) render(<Root />, document.querySelector('react'))
