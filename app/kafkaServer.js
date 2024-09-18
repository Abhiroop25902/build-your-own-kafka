import net from "net";
import { parseHeader } from "./utils.js";

const POSSIBLE_API_VERSIONS = [0, 1, 2, 3, 4];


/**
 * 
 * @param {net.Socket} socket 
 */
export default async function kafkaServer(socket) {
    //extra buffer is used to make sure fragmented data is saved
    let dataBuffer = Buffer.alloc(0);

    /**
     * 
     * @param {Buffer} buffer 
     */
    function processData(buffer) {
        dataBuffer = Buffer.concat([dataBuffer, buffer]);

        // while loop used as data might be coming in chunks, first 32 (4 bytes) bits determine the length 
        while (dataBuffer.length >= 4) {
            // length of the packet is in the first 32 bits
            const length = dataBuffer.readUInt32BE();

            if (dataBuffer.length < length + 4) return; //partial data, do not read yet

            //using of length data is done, remove it from the the buffer
            const packet = dataBuffer.subarray(4, length + 4);
            dataBuffer = dataBuffer.subarray(length + 4);

            const header = parseHeader(packet);

            const correlationIdBuffer = Buffer.alloc(4);
            correlationIdBuffer.writeUInt32BE(header.correlation_id);

            console.log(header);

            if (!POSSIBLE_API_VERSIONS.includes(header.request_api_version)) {
                const errorResponse = Buffer.concat([
                    Buffer.from([0, 0, 0, 6]), //first four bytes length => length is 6 bytes
                    correlationIdBuffer, // 4 bytes
                    Buffer.from([0, 35]) // Error code (35 = UNSUPPORTED_VERSION) [2 bytes]
                ]);
                socket.write(errorResponse);
            } else {
                //   ApiVersions Response (Version: 3) => error_code [api_keys] throttle_time_ms TAG_BUFFER 
                //      error_code => INT16
                //      api_keys => api_key min_version max_version TAG_BUFFER 
                //        api_key => INT16
                //        min_version => INT16
                //        max_version => INT16
                //      throttle_time_ms => INT32

                const responseData = Buffer.from([
                    0, 0, // Error code
                    3, // API keys length + 1
                    // ApiKeys[0]
                    0, header.request_api_key, // API key
                    0, 4, // Min API version
                    0, 4, // Max API version
                    0, // TAG BUFFER
                    // ApiKeys[1]
                    0, header.request_api_key, // API key
                    0, 4, // Min FETCH version
                    0, 16, // Max FETCH version
                    0, // TAG BUFFER
                    0, 0, 0, 0, // Throttle time
                    0, // End of Data
                ])

                const response = Buffer.concat([
                    Buffer.from([0, 0, 0, responseData.length + 4]), //first four bytes length
                    correlationIdBuffer, // 4 bytes
                    responseData
                ])

                socket.write(response);
            }

        }

    }

    socket.on('data', processData);

}