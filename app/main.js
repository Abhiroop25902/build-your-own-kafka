import net from "net"
import kafkaServer from "./kafkaServer.js";

const server = net.createServer(kafkaServer);

server.listen(9092, "127.0.0.1", () => {
  console.log('Server listening on port 9092');
});
