export default (input: any) => {
  // async api 2 check
  if (input?.type || input?.properties) {
    return input;
  }

  // Handle response outputs for openapi
  const successResponse = Object.entries(input).find(([statusCode, reponse]) => /2\d\d/.test(statusCode));

  if (!successResponse?.[1]) {
    return {};
  }

  const [code, response] = successResponse as [string, { schema: any, content: any }];

  if (response.schema) {
    // we are oa2
    return response.schema;
  } else {
    // we are oa3
    if (response.content && response.content['application/json']) {
      if (response.content['application/json'].schema) {
        return response.content['application/json'].schema;
      }
    }
  }
  // We also check if the input contains any valid OA schema by looking for type or properties in the provided object
  // The typical use case here if for async api payloads
  return (input?.type || input?.properties) ? input : {};
};
