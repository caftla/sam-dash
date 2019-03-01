import PG from "pg";
export async function run(query, params) {

  //console.log("CONN STRING", process.env.osui_connection_string)
   const client = new PG.Client({
    connectionString: process.env.osui_connection_string
  });
  try {
    await client.connect();
    const result = await client.query(query, params);
    return result;
  }
   catch(error) {
    console.log("ERRR", error);
  } 
  finally {
    await client.end();
  }
}