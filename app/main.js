import net from "net";

// You can use print statements as follows for debugging, they'll be visible when running tests.
console.log("Logs from your program will appear here!");

// Uncomment this block to pass the first stage
const server = net.createServer((connection) => {
  // Handle connection
    connection.on("data", (data) => {
        const str = data.toString();
        console.log({data, str});

        connection.write("\x00\x00\x00\x00\x00\x00\x00\x07");
        connection.end();
    })
});

server.listen(9092, "127.0.0.1");
