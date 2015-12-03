console.log("Loading event")
var aws = require('aws-sdk');
var s3 = new aws.S3({apiVersion: '2006-03-01'});
var ses = new aws.SES({apiVersion: '2010-12-01', region: 'us-east-1' });
exports.handler = function(event, context) {
    console.log('Received event:', JSON.stringify(event, null, 2));
    var bucket = event.Records[0].s3.bucket.name;
    var key = event.Records[0].s3.object.key;
    s3.getObject({Bucket: bucket, Key: key},
        function(err, data) {
            if (err){
                context.done('error', 'error getting file' + err);
            } else {
                console.log('data:' + data);
                var message = JSON.parse(data.Body);
                console.log('message:' + message);
                var eParams = {
                        Destination: {
                            ToAddresses: ["info@proudit.jp"]
                        },
                        Message: {
                            Body: {
                                Text: {
                                    Data: "mail：" + message.mail+ "\n" + "subject："+ message.name + "\n" + "contents："+ message.contents
                                }
                            },
                            Subject: {
                                Data: "HPからお問い合わせがありました。" + "From:" + message.url
                            }
                        },
                        Source: "info@proudit.jp"
                        };

                        console.log('===SENDING EMAIL===');
                        var email = ses.sendEmail(eParams, function(err, data){
                            if(err){
                                console.log("===EMAIL ERR===");
                                console.log(err);
                                context.done(null, 'ERR'); 
                            }else {
                                console.log("===EMAIL SENT===");
                                console.log(data);
                                context.done(null, 'SUCCESS');
                            }
                });
                console.log("EMAIL CODE END");
            }
        }
    );

};
