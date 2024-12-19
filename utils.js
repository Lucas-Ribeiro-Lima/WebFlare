export function Utils() {
  this.populateHttpObject = populateHttpObject

  function populateHttpObject(request, response) {
    if(response.isPopulated) return [ request, response]
    const reqObject = populateReqObject(request)
    const resObject = populateResObject(response)
    return [ reqObject, resObject ]
  }
  
  
  function populateReqObject(request) {
    const populatedReq = request
    const [ path, listOfParams ] = handlePath(populatedReq.url)
    const paramsObject = handleParams(listOfParams)
    populatedReq.basePath = path
    populatedReq.params = paramsObject
  
    return populatedReq
  }
  
  function populateResObject(response) {
    const populatedRes = response
    populatedRes.isPopulated = true

    populatedRes.send = (statusCode, data) => {
      populatedRes.statusCode = statusCode
      populatedRes.write(data)
      populatedRes.end()
    }
    return populatedRes
  }
  
  function handlePath(url) {
    const [ path, listOfParams ] = url.split("?")
    return [ path, listOfParams ]
  }
  
  function handleParams(listOfParams) {
    if(!listOfParams) return
    const params = listOfParams.split('&')
  
    return processParams(params)
  }

  function processParams(params) {
    const paramsObject = new Map()

    params.forEach(param => {
      const [ key, value ] = param.split("=")
      
      paramsObject.set(key, value)
    })

    return paramsObject
  }
}