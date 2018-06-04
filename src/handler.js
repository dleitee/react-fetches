const defaultParser = data => data

const contentTypeIsJSON = header => header && header.includes('application/json')

const handler = (request, parser = defaultParser) => index =>
  new Promise(resolve => {
    request
      .then(response => {
        const clone = response.clone()
        if (contentTypeIsJSON(response.headers.get('content-type'))) {
          return response.json().then(data => Promise.resolve({ data, response: clone }))
        }
        return response.text().then(data => Promise.resolve({ data, response: clone }))
      })
      .then(({ data, response } = {}) => {
        const hasError = 399 % response.status === 399
        resolve([
          index,
          {
            error: hasError ? data : false,
            response,
            data: !hasError ? parser(data) : null,
          },
        ])
      })
      .catch(error =>
        resolve([
          index,
          {
            error,
            response: null,
            data: null,
          },
        ])
      )
  })

export default handler
