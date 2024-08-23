import httpProxy from "http-proxy";
import http from "http";
import { FORKR_STATE } from "./state";
var proxy = httpProxy.createProxyServer({});
 
//
// Create your custom server and just call `proxy.web()` to proxy
// a web request to the target passed in the options
// also you can use `proxy.ws()` to proxy a websockets request
//
const PROXY_SERVER = http.createServer(function(req, res) {
  // You can define here your custom logic to handle the request
  // and then proxy the request.
  
  if(FORKR_STATE.rpcIsDisabled){
    res.writeHead(503, { 'Content-Type': 'text/plain' });
    res.end('RPC is disabled');
  } else {
    proxy.web(req, res, { target: 'http://localhost:1337', changeOrigin: true});
  }
});
 

export {
  PROXY_SERVER,
}