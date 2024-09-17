/**
 * @typedef {Object} RequestHeaderV2
 * @property {number} request_api_key   - 	The API key of this request.
 * @property {number} request_api_version - 	The API version of this request.
 * @property {number} correlation_id - The correlation ID of this request.
 * @property {string} client_id  - 	The client ID string.
 */


/**
 * 
 * @param {Buffer} data
 * @returns {RequestHeaderV2} Header Details 
 */
function parseHeader(data) {

    //header details
    //  request_api_key => INT16 (2 byte)
    //  request_api_version => INT16 (2 byte)
    //  correlation_id => INT32 (4 byte)
    //  client_id => NULLABLE_STRING

    // NOTE data from network is big-endian and our computer understands little-endian

    const request_api_key = data.subarray(0, 2).readUInt16BE();
    const request_api_version = data.subarray(2, 4).readUInt16BE();
    const correlation_id = data.subarray(4, 8).readUInt32BE();


    let clientIdEnd = 8;

    while (clientIdEnd < data.length && data[clientIdEnd] !== 0) {
        clientIdEnd++;
    }

    const clientId = data.subarray(8, clientIdEnd).toString('utf-8');

    return {
        request_api_key: request_api_key,
        request_api_version: request_api_version,
        correlation_id: correlation_id,
        client_id: clientId,
    }

}

export { parseHeader }
