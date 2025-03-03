// Fetch data from API 
async function fetchData(dataReq = {}) {
  let method = dataReq.method || '';
  let params = dataReq.params || '';
  let req = dataReq.req || (method == '' ? '/get_info' : '/json_rpc');
  let methodCall = dataReq.methodCall || (method == '' ? 'GET' : 'POST');

  let response = await fetch(`${config.api_url}${req}`, {
    method: methodCall.toUpperCase(),
    headers: { "Content-Type": "application/json" },
    body: methodCall.toUpperCase() === 'POST' ? 
      (dataReq.req ? JSON.stringify(params) : 
        JSON.stringify({
          "jsonrpc": "2.0",
          "id": "0",
          "method": method,
          "params": params
        })
      )
    : null
  });

  // Return data
  let data = await response.json();
  return data;
}

// Fetch data from API 
async function api(req) {
  let response = await fetch(`${config.new_api_url}${req}`, {
    method: "GET"
  });

  // Return data
  let data = await response.json();
  return data;
}