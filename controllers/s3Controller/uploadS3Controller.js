// Imports your configured client and any necessary S3 commands.
const { PutObjectCommand } = require("@aws-sdk/client-s3");
const { s3Client } = require('../s3Controller/s3Configiration');
const fs = require("fs")


// Specifies a path within your Space and the file to upload.
const bucketParams = {
    ACL: 'public-read',
    Bucket: "49hubdatacenter",
    Key: '',
    Body: '',
};

async function getFileStream (file) {
    var fileStream = fs.createReadStream(file[0].path)
    bucketParams.Key = file[0].filename
    bucketParams.Body = fileStream
    return  run()
}

// Uploads the specified file to the chosen path.
const run = async () => {
    try {
        const data = await s3Client.send(new PutObjectCommand(bucketParams));
        console.log(
            "Successfully uploaded object: " +
            bucketParams.Bucket +
            "/" +
            bucketParams.Key
        );
        console.log(data)
        return data;
    } catch (err) {
        console.log("Error", err);
    }
};

module.exports = { run, bucketParams, getFileStream };