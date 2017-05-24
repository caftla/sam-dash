// @flow

import Offline from 'offline-plugin/runtime'
import React from 'react'
import { Provider } from 'react-redux'
import { render } from 'react-dom'
// import { BrowserRouter, Route } from 'react-router-dom'

import createHistory from 'history/createBrowserHistory'
import { Route } from 'react-router'

import { ConnectedRouter, routerReducer, routerMiddleware, push } from 'react-router-redux'

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

Offline.install()

export const Root = () => {
  return <Provider store={store}>
    <ConnectedRouter history={history}>
      <Body>
        <Route exact path="/" component={Home} />
        <Route exact path="/dashboard" component={Dashboard} />
        <Route path="/filter_section_row/:date_from/:date_to/:filter/:section/:row" component={Filter_Section_Row} />
        <Route path="/filter_page_section_row/:timezone/:date_from/:date_to/:filter/:page/:section/:row" component={Filter_Page_Section_Row} />
        <Route path="/cohort/:date_from/:date_to/:filter" component={Cohort} />
        <Route path="/converting_ips/:date_from/:date_to/:filter" component={ConvertingIPs} />
        <Route path="/monthly_reports/:date_from/:date_to/:filter" component={MonthlyReports} />
        <Route path="/daily_reports_archive/:date_from" component={DailyReportsArchive} />
      </Body>
    </ConnectedRouter>
  </Provider>
}

if (!module.hot) render(<Root />, document.querySelector('react'))
