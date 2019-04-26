
import {run} from "./run";
import { encrypt, decrypt } from "./encryption";``


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

export async function getPageReleases (){
	try {
		const result = await run(
			`
			with Latests as (
				SELECT  max(id) as latest_id
				FROM page_releases as p
				LEFT JOIN (SELECT id as pu_id, page, country, scenario FROM page_uploads) u
				ON p.page_upload_id = u.pu_id
				GROUP BY u.page, u.country, u.scenario
			),
			LatestsPR as (
				SELECT * FROM Latests l
				INNER JOIN page_releases as p
				on p.id = l.latest_id
			)
			SELECT *,
			(select c.xcid from campaigns c where c.country = u.country and c.page = u.page and c.scenario = u.scenario and c.source_id = 1 order by c.id desc limit 1) as sam_xcid_id
			FROM LatestsPR p
			LEFT JOIN (SELECT id as pu_id, page, country, scenario FROM page_uploads) u
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
export async function createCampaign(page, country, affid, comments, scenario) {
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
				) VALUES (
					$1
				, $2
				, (select id from src)
				, $4
				,	$5
				)
				returning *
	    `,
	      [page, country, affid, comments, scenario]
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

export async function createMultipleCampaigns(payload) {
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
				//console.log("SOURCE_ID", obj.source_id)
				if(index + 1 !== rowLen){
					string = string + `('${obj.page}','${obj.country}','${obj.source_id}','${obj.comments}','${obj.scenario}'),`
				}else{
					string = string + `('${obj.page}','${obj.country}','${obj.source_id}','${obj.comments}','${obj.scenario}')`
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
						return await Promise.resolve({...result2.rows[0], affiliate_name, affiliate_id, offer_id})
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

export async function findCampaigns (page, country, affid, scenario){
  const result = await run(
		`
		with src as (select id from sources where affiliate_id = $3)
		SELECT *
				FROM campaigns c
				WHERE c.page = $1 AND c.country = $2 AND c.scenario = $4 AND c.source_id = (select id from src)
    `, [page, country, affid, scenario]
  )
  return (result.rows.length > 0) ? result.rows : [];
}

export async function findMultipleCampaigns (page, country, affid, scenario){
	const make_affids_string = (ids: array) =>{
		const affids = "'" + ids.join("','") + "'";

		//console.log("affids", ids)
		return affids;
	} 

	//console.log("make_affids_string", make_affids_string(affid))
	const queryString = `with src as (select id from sources where affiliate_id IN (${make_affids_string(affid)})),
	T as (SELECT *
			FROM campaigns c
			WHERE c.page = $1 AND c.country = $2 AND c.scenario = $3 AND c.source_id IN (select id from src))
	SELECT * FROM T
	LEFT JOIN sources as s ON T.source_id = s.id
			`

			
  const result = await run(
		queryString, [page, country, scenario]
  )

  return (result.rows.length > 0) ? result.rows : [];
}

export async function findOrCreateCampaign (page, country, affid, comments, scenario){
	const result = await findCampaigns(page, country, affid, scenario);
	if(result.length > 0){
		return result[0];
	}else{
		return createCampaign(page, country, affid, comments, scenario);
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
			)
			
			SELECT *
			FROM campaigns C
			INNER JOIN M ON C.source_id = M.id
			ORDER BY C.date_created DESC

    `, []
  )

  return result.rows
}