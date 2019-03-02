import fs from "fs";
import  path from "path";
import S3 from "aws-sdk/clients/s3";
import slugify from "slugify";
import mime from "mime-types";
import envfile from "envfile";
import moment from "moment";
import { exec } from "child_process";

const execute = (command, callback)=>{
  exec(command, (error, stdout, stderr) => callback(stdout));
};
const BUCKET_NAME = "mobirun";

const client = new S3({
  accessKeyId: process.env.osui_aws_access_key_id,
  secretAccessKey: process.env.osui_secret_access_key
});

function publishPage(
  s3UploadDir,
  s3StageFile,
  s3ProdFile
) {
  const s3FullPathStage = s3UploadDir + s3StageFile;
  const s3FullPathProd = s3UploadDir + s3ProdFile;
  console.log(`Publishing ${s3StageFile} -> ${s3ProdFile}`);
  console.log(`${BUCKET_NAME}/${s3FullPathStage}`);

  client
    .copyObject({
      Bucket: BUCKET_NAME,
      CopySource: `${BUCKET_NAME}/${s3FullPathStage}`,
      Key: s3FullPathProd,
      ACL: 'public-read'
    })
    .promise()
    .then(res => {
      console.log(res);
    })
    .catch(err => {
      console.error(err);
    });
}

function cacheAndPublishPage(
  s3UploadDir,
  s3StageFile,
  s3ProdFile
) {
  const now = moment()
    .format("YYYYMMDDHHMMSS")
    .toString();
  const cachePageName = `${s3ProdFile}.${now}`;
  const s3FullPathProd = s3UploadDir + s3ProdFile;

  console.log(`Caching current ${s3ProdFile} -> ${cachePageName}`);
  client
    .copyObject({
      Bucket: BUCKET_NAME,
      CopySource: `${BUCKET_NAME}/${s3FullPathProd}`,
      Key: s3UploadDir + cachePageName,
      ACL: 'public-read'
    })
    .promise()
    .then(() =>
      client
        .deleteObject({
          Bucket: BUCKET_NAME,
          Key: s3FullPathProd
        })
        .promise()
        .then(() => publishPage(s3UploadDir, s3StageFile, s3ProdFile))
    )
    .catch(err => {
      console.error(err);
    });
}

export default async (page, country, scenario) => {

  const slugifiedScenario = slugify(scenario, { lower: true });
  const s3UploadDir = `os-ui/static/${page}/html/`;
  const s3ProdFile = `${country}-${slugifiedScenario}-production.html`;
  const s3StageFile = `${country}-${slugifiedScenario}-staging.html`;

  const params = {
    Bucket: BUCKET_NAME,
    Key: s3UploadDir + s3ProdFile
  };

  // Check whether file exist or not
  // and perform appropriate action
  try {
    const data = await client.headObject(params).promise()
    return cacheAndPublishPage(s3UploadDir, s3StageFile, s3ProdFile);
  } catch (err) {
    if (err && err.statusCode === 404) {
      return publishPage(s3UploadDir, s3StageFile, s3ProdFile);
    } else {
      throw err
    }
  }
}
