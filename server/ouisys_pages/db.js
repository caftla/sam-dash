
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
    `SELECT *
				FROM page_uploads u
				WHERE  NOT EXISTS (SELECT * FROM page_releases t WHERE t.page_upload_id = u.id)
        ORDER BY date_created DESC
    `, []
  )

  return (result.rows.length > 0) ? result.rows : [];
}

export async function getPageReleases (){
  const result = await run(
    `SELECT *
				FROM page_releases r
				LEFT JOIN (SELECT id, page, country, scenario FROM page_uploads) u
				ON r.page_upload_id = u.id
				ORDER BY r.date_created DESC
				LIMIT 100
    `, []
  )

  return (result.rows.length > 0) ? result.rows : [];
}
export async function createCampaign(page, country, affid, comments, scenario) {

	//console.table([page, country, affid, comments, scenario]);
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

export async function publishPage(html_url, page_upload_id, username) {

	//console.table([page, country, affid, comments, scenario]);
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