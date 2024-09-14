import net from "net";

const server = net.createServer((connection) => {
  // Handle connection
    connection.on("data", (data) => {
        const request_api_key = data.subarray(0, 2);
        const request_api_version = data.subarray(2, 4);
        const correlation_id = data.subarray(4, 12);

        const api_version = request_api_version.readUInt16BE();

        if(api_version>=0 && api_version<4){
          connection.write(correlation_id);
        }else{
          const err  = Buffer.from(['00', '35']);
          const responseLength = correlation_id.length+ err.length;
          const errorBuffer = Buffer.concat([correlation_id, err], responseLength);
          connection.write(errorBuffer);
        }
    })
});

server.listen(9092, "127.0.0.1");
