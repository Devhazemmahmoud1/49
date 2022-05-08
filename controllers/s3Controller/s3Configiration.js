const  { S3 } = require("@aws-sdk/client-s3");

const s3Client = new S3({
    endpoint: "https://nyc3.digitaloceanspaces.com",
    region: "us-east-1",
    credentials: {
      accessKeyId: '3YDTWFAHOZMVU5WAKXG2',
      secretAccessKey: 'lay1S/89Nc0uY4cuH0QP0/u+bWfUyKhv//UbiIEKR+8'
    }
});

module.exports = { s3Client };