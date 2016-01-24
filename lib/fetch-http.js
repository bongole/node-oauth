var URL= require('url');

if( !fetch ){
    var fetch = require('node-fetch');
}

exports.request = function(options){
    return new FetchHttpRequest(options);
}

function FetchHttpRequest(options){
    this._events = {};
    this._body = null;
    this._options = options;
}

function FetchHttpResponse(response){
    this.statusCode = response.status;
}

FetchHttpRequest.prototype.on = function(event, func){
    this._events[event] = func;
}

FetchHttpRequest.prototype.end = function(){
    var options = this._options;
    var protocol = options.port === 443 ? 'https' : 'http'; 
    var method = options.method;
    var uri = URL.format({host: options.host, protocol: protocol, pathname: options.path });
    var events = this._events;

    fetch(uri, {
        method: options.method,
        headers: options.headers,
        body: this._body
    }).then(function(res){
        if( events.response ){
            events.response(new FetchHttpResponse(res));
        }

        return res.text();
    }).then(function(text){
        if( events.data ){
            events.data(text);
        }

        if( events.end ){
            events.end();
        }
    }).catch(function(err){
        if( events.error ){
            events.error(err);
        }
    });
}

FetchHttpRequest.prototype.write = function(body){
    this._body = body;
}
