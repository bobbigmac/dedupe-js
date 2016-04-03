var bodyParser = Npm.require("body-parser");

WebApp.connectHandlers
	//.use(bodyParser.urlencoded())
	.use(bodyParser.json());

WebApp.connectHandlers.use('/dedupe',
	Meteor.bindEnvironment(function(req, res, next) 
{
	var content = false, code = 0;
	try {
		var body = (req.body instanceof Object && req.body) || false;
				body = body || (req.query instanceof Object && req.query) || false;

		console.log(body);
		if(body) {
			content = Meteor.call('dedupe',
				body.documents,
				body.fields,
				body.threshold,
				body.missingValue
			);
			code = 200;
		}
	} catch(exc) {
		console.log(exc);
		code = 500;
	}

	if(!code) {
		code = 400;
	}

	if(code) {
		res.statusCode = ""+code;
	}

  res.setHeader("Access-Control-Allow-Origin", "*");
	if(content) {
		var type = 'text/plain';
		if(typeof content !== 'string') {
			type = 'application/json';
			content = JSON.stringify(content);
		}

		res.setHeader('Content-Length', Buffer.byteLength(content, 'utf8'));
		res.setHeader('Content-Type', type);
		res.write(content);
	}

	res.end();
	return;
}));