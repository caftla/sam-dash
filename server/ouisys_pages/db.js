
import {run} from "./run";
import { encrypt, decrypt, encrypt_text, decrypt_text } from "./encryption";``

export async function findSourceByHash (hash){
	const result = await run(
		`SELECT *
				FROM affiliates where hash = $1
		`, [hash]
	)
	return (result.rows.length > 0) ? result.rows[0] : null;
}

export async function getUserCampaigns (id){
	const result = await run(
		`SELECT *
				FROM campaigns where source_id = $1
				ORDER BY date_created DESC
		`, [id]
	)
	return (result.rows.length > 0) ? result.rows : [];
}

export async function getUploadedPages (){
	const result = await run(
		`with Latests as (
				select p.page, p.country, p.scenario, max(id) as latest_id from page_uploads as p
				group by p.page, p.country, p.scenario
			)
			select p.* from Latests as l
			inner join page_uploads as p
			on p.id = l.latest_id
			WHERE  NOT EXISTS (SELECT * FROM page_releases t WHERE t.page_upload_id = p.id)
			ORDER BY p.date_created DESC;
		`, []
	)
	return (result.rows.length > 0) ? result.rows : [];
}

export async function getSearchPages (params){

	const { key, value } = params; 
	const result = await run(
		`with Latests as (
				select p.page, p.country, p.scenario, max(id) as latest_id from page_uploads as p
				group by p.page, p.country, p.scenario
			)
			select p.* from Latests as l
			inner join page_uploads as p
			on p.id = l.latest_id
			WHERE  NOT EXISTS (SELECT * FROM page_releases t WHERE t.page_upload_id = p.id) AND
			p.${key} LIKE '%${value}%'

			ORDER BY p.date_created DESC;
		`, []
	)
	return (result.rows.length > 0) ? result.rows : [];
}

export async function getPageReleases (){
	try {
		const result = await run(
			`
			with Latests as (
				SELECT  max(id) as latest_id
				FROM page_releases as p
				LEFT JOIN (SELECT id as pu_id, page, country, scenario, strategy, scenarios_config, env_dump FROM page_uploads) u
				ON p.page_upload_id = u.pu_id
				GROUP BY
				CASE WHEN (u.scenario = '') IS NOT FALSE THEN
					(u.page, u.country, u.strategy, u.scenarios_config)
					ELSE (u.page, u.country, u.scenario) END
			),
			LatestsPR as (
				SELECT * FROM Latests l
				INNER JOIN page_releases as p
				on p.id = l.latest_id
			)
			SELECT *,
			(select c.xcid from campaigns c where c.country = u.country and c.page = u.page and
			CASE WHEN (u.scenario = '') IS NOT FALSE THEN
				(c.strategy = u.strategy and c.scenarios_config = u.scenarios_config)
				ELSE (c.scenario = u.scenario ) END
			and c.source_id = 1
			order by c.id desc limit 1) as sam_xcid_id
			FROM LatestsPR p
			LEFT JOIN (SELECT id as pu_id, page, country, scenario, strategy, scenarios_config, env_dump FROM page_uploads) u
			ON p.page_upload_id = u.pu_id
			ORDER BY p.date_created DESC;
			`, []
		)

	return (result.rows.length > 0) ? result.rows : [];
	} catch(ex) {
		console.error(ex)
		throw ex
	}
}
export async function createCampaign(page, country, affid, comments, scenario, strategy, scenarios_config) {
	const manager_id = encrypt(username);

	console.log("MANAGER ID", decrypt("NQ"))
	try{
			const result = await run(
				`
				with src as (select id from sources where affiliate_id = $3)
				INSERT INTO campaigns(
					page
				, country
				, source_id
				, comments
				, scenario
				, strategy
				, scenarios_config
				, manager_name
				, manager_id
				) VALUES (
					$1
				, $2
				, (select id from src)
				, $4
				,	$5
				,	$6
				,	$8
				,	$9
				)
				returning *
			`,
				[page, country, affid, comments, scenario, strategy, scenarios_config, username, manager_id]
			);
			const campaign = result.rows[0];
			const xcid = encrypt(campaign.id);
			const result2 = await run(
				`
						update campaigns set xcid = $2 where id = $1
						returning *
				`,
				[campaign.id, xcid]
			);

			const {affiliate_name, affiliate_id, offer_id} = (await getASource(campaign.source_id)) || {affiliate_name: null, affiliate_id: null, offer_id: null}

			return {...result2.rows[0], affiliate_name, affiliate_id, offer_id}
	}catch(error){

	}
}

export async function createMultipleCampaigns(payload, username) {
	const manager_id = encrypt_text(username);
	try{
		const newArr = [];
		Object.keys(payload).map((val, index)=>{
			newArr.push(
				payload[val]
			);
		});

		const make_values_string = (values:array)=>{

			let string = "";
			const rowLen = values.length;
			values.map((obj, index)=>{
				if(index + 1 !== rowLen){
					string = string + `('${obj.page}','${obj.country}','${obj.source_id}','${obj.comments}',${obj.scenario ? `'${obj.scenario}'` : null},${obj.strategy ? `'${obj.strategy}'` : null},${obj.scenarios_config ? `'${obj.scenarios_config}'` : null}, '${username}', '${manager_id}'),`
				}else{
					string = string + `('${obj.page}','${obj.country}','${obj.source_id}','${obj.comments}',${obj.scenario ? `'${obj.scenario}'` : null},${obj.strategy ? `'${obj.strategy}'` : null},${obj.scenarios_config ? `'${obj.scenarios_config}'` : null}, '${username}', '${manager_id}')`
				}
			});
			return string;
		}

		const queryString = `
			INSERT INTO campaigns(
				page
			, country
			, source_id
			, comments
			, scenario
			, strategy
			, scenarios_config
			, manager_name
			, manager_id
			) VALUES ${make_values_string(newArr)}
			returning *
		`;
			const result = await run(queryString);

			const finalResult = async () => {
				return await Promise.all(result.rows.map(async(obj, index)=>{
						const campaign = obj;
						const xcid = encrypt(campaign.id);
						const result2 = await run(
							`
									update campaigns set xcid = $2 where id = $1
									returning *
							`,
							[campaign.id, xcid]
						);
						const {affiliate_name, affiliate_id, offer_id} = (await getASource(campaign.source_id)) || {affiliate_name: null, affiliate_id: null, offer_id: null}
						return (result2.rows.length > 0) ?
						await Promise.resolve({...result2.rows[0], affiliate_name, affiliate_id, offer_id})
						: {};
					})
				)
			}

			return finalResult()


	}catch(error){

		console.log("CREATE CAMPAIGN ERROR ERROR", error)

	}
}



export async function updateCampaignStatus(xcid, http_status) {
	try{
			const result = await run(
				`
						update campaigns set http_status = $2 where xcid = $1
						returning *
				`,
				[xcid, http_status]
			);
			return result.rows[0]
	}catch(error){

	}
}

export async function updatePublishedPage(req) {
	const {key, id, value} = req;
	try{
			const result = await run(
				`
						update page_releases set ${key} = $2 where id = $1
						returning *
				`,
				[id, value]
			);
			return result.rows[0]
	}catch(error){
		throw error
	}
}

export async function updateCampaign(req) {
	const {key, xcid, value} = req;
	try{
			const result = await run(
				`
						update campaigns set ${key} = $2 where xcid = $1
						returning *
				`,
				[xcid, value]
			);
			return result.rows[0]
	}catch(error){
		throw error
	}
}

export async function findCampaigns (page, country, affid, scenario, strategy, scenarios_config){

	const result = scenario ? await run(
		`
		with src as (select id from sources where affiliate_id = $3)
		SELECT *
				FROM campaigns c
				WHERE c.page = $1 AND c.country = $2 AND c.scenario = $4 AND c.source_id = (select id from src)
		`, [page, country, affid, scenario]
	):
	await run(
		`
		with src as (select id from sources where affiliate_id = $3)
		SELECT *
				FROM campaigns c
				WHERE c.page = $1 AND c.country = $2 AND c.strategy = $4 AND c.scenarios_config = $5 AND c.source_id = (select id from src)
		`, [page, country, affid, strategy, scenarios_config]
	)
	return (result.rows.length > 0) ? result.rows : [];
}

export async function findMultipleCampaigns (page, country, affid, scenario, strategy, scenarios_config){
	const make_affids_string = (ids: array) =>{
		const affids = "'" + ids.join("','") + "'";

		//console.log("affids", ids)
		return affids;
	}

	//console.log("make_affids_string", make_affids_string(affid))
	const queryString = scenario ? `with src as (select id from sources where affiliate_id IN (${make_affids_string(affid)})),
	T as (SELECT *
			FROM campaigns c
			WHERE c.page = $1 AND c.country = $2 AND c.scenario = $3 AND c.source_id IN (select id from src))
	SELECT * FROM T
	LEFT JOIN sources as s ON T.source_id = s.id
			`
			:
			`with src as (select id from sources where affiliate_id IN (${make_affids_string(affid)})),
	T as (SELECT *
			FROM campaigns c
			WHERE c.page = $1 AND c.country = $2 AND c.strategy = $3 AND c.scenarios_config = $4 AND c.source_id IN (select id from src))
	SELECT * FROM T
	LEFT JOIN sources as s ON T.source_id = s.id
			`


	const result = scenario ? await run(
		queryString, [page, country, scenario]
	):
	await run(
		queryString, [page, country, strategy, scenarios_config]
	)

	return (result.rows.length > 0) ? result.rows : [];
}

export async function findOrCreateCampaign (page, country, affid, comments, scenario, strategy, scenarios_config, username){
	const result = await findCampaigns(page, country, affid, scenario, strategy, scenarios_config);
	if(result.length > 0){
		return result[0];
	}else{
		return createCampaign(page, country, affid, comments, scenario, strategy, scenarios_config, username);
	}
}

export async function publishPage(html_url, page_upload_id, username) {

	try{
			const result = await run(
				`
				 INSERT INTO page_releases(
						html_url
					, page_upload_id
					, username
					) VALUES (
						$1
					, $2
					, $3
					)
					returning *
			`,
				[html_url, page_upload_id, username]
			);

			return result.rows[0];
	}catch(error){
		return Promise.reject(error)
	}
}
export async function getASource(source_id) {
	const result = await run(
		`
		with T as (
			SELECT t1.affiliate_id, t1.affiliate_name
				FROM dblink('helix_server'::text, '
					select affiliate_id, affiliate_name from affiliate_mapping
			'::text) t1(affiliate_id text, affiliate_name text)
		),
		U as (
			select sources.*, T.affiliate_name from sources inner join T on sources.affiliate_id = T.affiliate_id
			UNION
			select sources.*, null as affiliate_name from sources where sources.offer_id is null
		)
		select * from U where id = $1
		`, [source_id]
	)

	return result.rows.length > 0 ? result.rows[0] : null
}

export async function getSources() {
	const result = await run(
		`
		with T as (
			SELECT t1.affiliate_id, t1.affiliate_name
				FROM dblink('helix_server'::text, '
					select affiliate_id, affiliate_name from affiliate_mapping
			'::text) t1(affiliate_id text, affiliate_name text)
		)
		select sources.*, T.affiliate_name from sources inner join T on sources.affiliate_id = T.affiliate_id
		UNION
		select sources.*, null as affiliate_name from sources where sources.offer_id is null
		order by affiliate_id ;
		`, []
	)

	return result.rows
}


export async function getAllCampaigns() {
	const result = await run(
		`
			with T as (
				SELECT t1.affiliate_id, t1.affiliate_name
					FROM dblink('helix_server'::text, '
						select affiliate_id, affiliate_name from affiliate_mapping
				'::text) t1(affiliate_id text, affiliate_name text)
			),
			M as (
				select sources.*, T.affiliate_name from sources inner join T on sources.affiliate_id = T.affiliate_id
				UNION
				select sources.*, null as affiliate_name from sources where sources.offer_id is null
				order by affiliate_id
			),
			LatestUploads as (
				select p.page, p.country, p.scenario, p.strategy, p.scenarios_config, max(id) as latest_id from page_uploads as p
				group by p.page, p.country, p.scenario, p.strategy, p.scenarios_config
			),
			PR as (
				select p.id, p.scenario, p.page, p.country, p.strategy, p.scenarios_config, p.env_dump, id as page_up_id from LatestUploads as l
				inner join page_uploads as p
				on p.id = l.latest_id
			),
			CA as (SELECT *
				FROM campaigns C
				INNER JOIN M ON C.source_id = M.id
				INNER JOIN PR ON 
				CASE WHEN (PR.scenario = '') IS NOT FALSE THEN 
				(
					CASE WHEN (PR.strategy = '' AND PR.scenarios_config = '') IS NOT FALSE THEN
						(
							C.page = PR.page AND
							C.country = PR.country
						)
						ELSE(
							C.page = PR.page AND
							C.country = PR.country AND
							C.strategy = PR.strategy AND
							C.scenarios_config = PR.scenarios_config
						)
					END
				) 
				ELSE (
					C.page = PR.page AND
					C.scenario = PR.scenario AND
					C.country = PR.country
				) END
				ORDER BY C.date_created DESC
			)

			SELECT * FROM (
				SELECT DISTINCT ON (xcid) *, CA.date_created as ca_date_created FROM CA
				LEFT JOIN page_releases pl
				ON CA.page_up_id = pl.page_upload_id
			) C
			ORDER BY ca_date_created DESC;
		`, []
	)

	return result.rows
}


export async function createScenarioConfiguration(payload) {
		const newArr = [];
		Object.keys(payload.flows).map((val, index)=>{
			if(payload.flows[val]){
				newArr.push({
					client:val,
					...payload.config
				});
			}
		});

		const make_values_string = (values:array)=>{

			let string = "";
			const rowLen = values.length;
			values.map((obj, index)=>{
				if(index + 1 !== rowLen){
					string = string + `('${obj.country}','${obj.scenario}','${obj.service}','${obj.host}','${obj.device}','${obj.client}'),`
				}else{
					string = string + `('${obj.country}','${obj.scenario}','${obj.service}','${obj.host}','${obj.device}','${obj.client}')`
				}
			});
			return string;
		}

		const queryString = `
			INSERT INTO ouisys_scenarios(
				country
			, scenario
			, service
			, host
			, device
			, client
			) VALUES ${make_values_string(newArr)}
			returning *
		`;
				
		try{
			const result = await run(queryString);
			return result;
		}catch(err){
			throw err
		}
		
}


export async function getScenarios (){

	const result = await run(
		`
		SELECT *
			FROM ouisys_scenarios
			ORDER BY date_created DESC
		`, []
	)
	return (result.rows.length > 0) ? result.rows : [];
}