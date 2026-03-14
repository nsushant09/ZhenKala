const OSS = require('ali-oss');

const client = new OSS({
  region: process.env.OSS_REGION,
  accessKeyId: process.env.OSS_ACCESS_KEY,
  accessKeySecret: process.env.OSS_SECRET_KEY,
  bucket: process.env.OSS_BUCKET,
});

module.exports = client;

