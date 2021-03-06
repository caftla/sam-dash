const QuseryServer = require('../output/Server.QueryServer')
const QueryTemplateParser = require('../output/Server.QueryTemplateParser')
const fs = require('fs')

const {
    queryAsync, getQueryState, querySync
} = QuseryServer.connect(process.env.tola_connection_string)()

const { fromAff } = QuseryServer


async function main () {

    const template = fs.readFileSync('./server/sql-templates/sessions.sql', 'utf8')

    const sql = await fromAff(
        QueryTemplateParser.doTemplateStringDates('country_code:MX,affiliate_id:JB')('day')(0)('2018-06-12')('2018-06-18')(template)
    )()
    
    console.log(sql)
    
    return fromAff(querySync(true)('1')(sql))()

}

async function main_tola () {

    const template = fs.readFileSync('./server/sql-templates/tola.sql', 'utf8')

    const sql = await fromAff(
        QueryTemplateParser.doTemplateStringDates('')('day')(0)('2018-06-12')('2018-06-18')(template)
    )()
    
    console.log(sql)
    
    return fromAff(querySync(true)('1')(sql))()

}

main().then(console.log).catch(console.log)
