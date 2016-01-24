var URL= require('url');

if( !fetch ){
    var fetch = require('node-fetch');
}

exports.request = function(options){
    return new FetchHttpRequest(options);
}

function FetchHttpRequest(options){
    this._body = null;
    this._options = options;
    this._events = {};
}

function FetchHttpResponse(){
    this.statusCode = null;
    this._events = {};
}

FetchHttpResponse.prototype.on = function(event, func){
    this._events[event] = func;
}

FetchHttpRequest.prototype.on = function(event, func){
    this._events[event] = func;
}

FetchHttpRequest.prototype.end = function(){
    var options = this._options;
    var protocol = options.port === 443 ? 'https' : 'http'; 
    var method = options.method;
    var uri = URL.format({hostname: options.host, protocol: protocol, 
                          port: options.port, pathname: options.path });

    var response = new FetchHttpResponse();
    var req_events = this._events;

    fetch(uri, {
        method: options.method,
        headers: options.headers,
        body: this._body
    }).then(function(res){
        if( req_events.response ){
            response.statusCode = res.status;
            req_events.response(response);
        }

        return res.text();
    }).then(function(text){
        if( response._events.data ){
            response._events.data(text);
        }

        if( response._events.end ){
            response._events.end();
        }
    }).catch(function(err){
        if( req_events.error ){
            req_events.error(err);
        }
    });
}

FetchHttpRequest.prototype.write = function(body){
    this._body = body;
}
