// @flow

import Offline from 'offline-plugin/runtime'
import React from 'react'
import { Provider } from 'react-redux'
import { render } from 'react-dom'
// import { BrowserRouter, Route } from 'react-router-dom'

import createHistory from 'history/createBrowserHistory'
import { Route, Switch } from 'react-router'
import { Redirect } from 'react-router'
import { match } from './adts'
const PH = require('./Hello.purs')
const P = require('./QueryDSL/Parser/UrlQueryParser.purs')
const PT = require('./QueryDSL/Types.purs')

window.P = P
window.PT = PT
console.log(PH.sayHello)

import URI from 'urijs'

import { ConnectedRouter, routerReducer, routerMiddleware, push } from 'react-router-redux'
// import './index.styl'
import './index.styl'

const history = createHistory()


import { store } from './store'
import { connect } from 'react-redux'
import {
  login, check_loggedin
} from './actions'


import Home from './components/Home'
import Login from './components/Login'
import Dashboard from './components/Dashboard'
import Filter_Section_Row from './components/filter_section_row'
import Filter_Page_Section_Row from './components/filter_page_section_row'
import User_Sessions from './components/user_sessions'
import Sessions from './components/sessions'
import Revenue from './components/revenue'

import MPesa from './components/m-pesa'
import Dmb from './components/dmb'
import User_Subscriptions from './components/user_subscriptions'
import Coinvoices from './components/co_invoices'
import Transactions from './components/transactions'
import ARPU_Long from './components/arpu_long'
import Weekly_Reports from './components/weekly_reports'
import Cohort from './components/cohort'
import Arpu from './components/arpu'
import ConvertingIPs from './components/converting_ips'
import MonthlyReports from './components/monthly_reports'
import DailyReportsArchive from './components/daily_reports_archive'
import OuisysPages from './components/ouisys_pages'
import NotFound from './components/404'
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
  localStorage.setItem('img', tokenFromURL.img)
  window.history.replaceState({}, window.title, URI(window.location.href).removeSearch('token', 'img'))
}

const token = localStorage.getItem('token')
const queryString = fromQueryString(window.location.search.substring(1))
if (!token && !queryString.login_redir) {
  const url = window.location.href
  const newUrl = '/login?login_redir=' + encodeURIComponent(url)
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
  
  // logout() {
  //   localStorage.removeItem('token');
  //   window.location = "https://mail.google.com/mail/u/0/?logout&hl=en";

  // }

    componentWillUnMount() {
      if(!!this.unlisten) {
        this.unlisten();
      }
    }
    render() {
      console.log('%%%% ', this.state.route)
      const user_img = localStorage.getItem('img', tokenFromURL.img)
      const img_decoded = decodeURIComponent(user_img)
      return <div id="main">

        <div id="header">
            
            <ul id="main-area">
            
              <li id="filter-menu" className="active" onClick={ () => {
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
          
              <a href="/user_sessions/" className={this.state.route == 'user_sessions' ? 'active' : ''}>Sessions</a>

              <a href="/weekly_reports/" className={ this.state.route == 'weekly_reports' ? 'active' : ''  }>Standard +</a>

              <a href="/revenue/" className={ this.state.route == 'revenue' ? 'active' : ''  }>Revenue</a>

              <a href="/user_subscriptions/" className={this.state.route == 'user_subscriptions' ? 'active' : ''}>Subscriptions</a>
              
              <a href="/converting_ips/" className={ this.state.route == 'converting_ips' ? 'active' : ''  }>IPs</a>          
              
              <a href="/arpu_long/" className={ this.state.route == 'arpu_long' ? 'active' : ''  }>ARPU</a>

              <a href="/co_invoices/" className={this.state.route == 'co_invoices' ? 'active' : ''}>Affiliates</a>

              <a href="/transactions/" className={ this.state.route == 'transactions' ? 'active' : ''  }>Transactions</a>

              <a href="/monthly_reports/" className={ this.state.route == 'monthly_reports' ? 'active' : ''  }>Monthly Report</a>

              <a href="/m-pesa/" className={ this.state.route == 'm-pesa' ? 'active' : ''  }>M-Pesa</a>



              <a href="/dmb/" className={ this.state.route == 'dmb' ? 'active' : ''  }>DMB</a>

              <a href="/ouisys-pages/" className={ this.state.route == 'ouisys-pages' ? 'active' : ''  }>Ouisys Pages</a>

              { this.state.route != 'login' 
              
                ? <div style={{position: 'absolute', right: '10px', top: '0px', display: "inline-block" }}>

              <img  src={img_decoded} height={35} width={35} />
                            
              </div> : ''}                 

            </div>

          
            
            <div id="bar"></div>

                    
        </div>	

        <WrappedComponent {...this.props} />

      </div>
    }
  }
}

function RequiresAuth(WrappedComponent) {
  return connect(state => ({ login_state: state.login }), { check_loggedin})(props => {
    const url = window.location.href
    const newUrl = '/login?login_redir=' + encodeURIComponent(url)
    return match({
      Nothing: () => { props.check_loggedin(); return <div>Nothing</div> }
      , Loading: () => <div>Loading...</div>
      , Error: (error) => <div>Error: {error.toString()}</div>
      , Loaded: (data) => {
        try {
          return !data ? window.location.href = newUrl : <WrappedComponent {...props} />
        } catch(ex) {
          return <div>ERROR</div>
        }
      }
    })(props.login_state)
  })
}

const WrapAndAuth = x => RequiresAuth(Wrap(x))

const main_bottom = <Provider store={store}>
  <ConnectedRouter history={history}>
    <Body>
      <Switch>
        <Route exact path="/" component={WrapAndAuth(Home)} />
        <Route exact path="/login" component={Wrap(Login)} />
        <Route exact path="/dashboard" component={WrapAndAuth(Dashboard)} />
        
        { /* deprecated  */ }
        <Route path="/filter_page_section_row/:timezone/:date_from/:date_to/:filter/:page/:section/:row" component={WrapAndAuth(User_Sessions)} />
        <Route path="/filter_page_section_row" exact={true} component={WrapAndAuth(User_Sessions)} />

        <Route path="/transactions/:timezone/:date_from/:date_to/:filter/:page/:section/:row" component={WrapAndAuth(Transactions)} />
        <Route path="/transactions" exact={true} component={WrapAndAuth(Transactions)} />

        <Route path="/user_sessions/:timezone/:date_from/:date_to/:filter/:page/:section/:row" component={WrapAndAuth(User_Sessions)} />
        <Route path="/user_sessions" exact={true} component={WrapAndAuth(User_Sessions)} />

        { /* TODO
        <Route path="/sessions/:timezone/:date_from/:date_to/:filter/:breakdown" component={WrapAndAuth(Sessions)} />
        <Route path="/sessions/" component={WrapAndAuth(Sessions)} />
        */}

        <Route path="/revenue/:timezone/:date_from/:date_to/:filter/:breakdown" component={WrapAndAuth(Revenue)} />
        <Route path="/revenue/" component={WrapAndAuth(Revenue)} />

        <Route path="/m-pesa/:timezone/:date_from/:date_to/:filter/:breakdown" component={WrapAndAuth(MPesa)} />
        <Route path="/m-pesa" component={WrapAndAuth(MPesa)} />

        <Route path="/dmb/:timezone/:date_from/:date_to/:filter/:breakdown" component={WrapAndAuth(Dmb)} />
        <Route path="/dmb" component={WrapAndAuth(Dmb)} />

        <Route path="/user_subscriptions/:timezone/:date_from/:date_to/:filter" component={WrapAndAuth(User_Subscriptions)} />
        <Route path="/user_subscriptions" exact={true} component={WrapAndAuth(User_Subscriptions)} />

        <Route path="/co_invoices/:timezone/:date_from/:date_to/:filter" component={WrapAndAuth(Coinvoices)} />
        <Route path="/co_invoices" exact={true} component={WrapAndAuth(Coinvoices)} />

        <Route path="/arpu_long/:date_from/:date_to/:filter/:page/:section/:row" component={WrapAndAuth(ARPU_Long)} />
        <Route path="/arpu_long" exact={true} component={WrapAndAuth(ARPU_Long)} />

        <Route path="/weekly_reports/:date_from/:date_to/:filter/:page/:section/:row" component={WrapAndAuth(Weekly_Reports)} />
        <Route path="/weekly_reports" exact={true} component={WrapAndAuth(Weekly_Reports)} />

        <Route path="/cohort" exact={true} component={WrapAndAuth(Cohort)} />
        <Route path="/arpu" exact={true} component={WrapAndAuth(Arpu)} />      
        <Route path="/cohort/:date_from/:date_to/:filter" component={WrapAndAuth(Cohort)} />
        
        <Route path="/converting_ips/" exact={true} component={WrapAndAuth(ConvertingIPs)} />
        <Route path="/converting_ips/:date_from/:date_to/:filter" component={WrapAndAuth(ConvertingIPs)} />
        
        <Route path="/monthly_reports/" exact={true} component={WrapAndAuth(MonthlyReports)} />
        <Route path="/monthly_reports/:date_from/:date_to/:filter/:breakdown" component={WrapAndAuth(MonthlyReports)} />
        <Route path="/daily_reports_archive/:date_from" component={WrapAndAuth(DailyReportsArchive)} />
        <Route path="/hourly_reports_archive/:date_from" component={WrapAndAuth(DailyReportsArchive)} />
        <Route path="/ouisys-pages" exact={true} component={WrapAndAuth(OuisysPages)} />
        <Route exact path="*" component={Wrap(NotFound)} >
          <Route Route exact path="*" component={Wrap(NotFound)} />
        </Route>
      </Switch>
    </Body>
  </ConnectedRouter>
</Provider>


export const Root = (args) => {
  return main_bottom
}

window.store = store


if (!module.hot) render(<Root />, document.querySelector('react'))
