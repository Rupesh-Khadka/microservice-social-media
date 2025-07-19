import amqp, {
  Channel,
  Connection,
  Message,
  Options,
} from "amqplib/callback_api";
import logger from "./logger";

let connection: Connection | null = null;
let channel: Channel | null = null;

const EXCHANGE_NAME = "social_media_events";

export async function connectToRabbitMq(): Promise<Channel | null> {
  try {
    const conn = await new Promise<Connection>((resolve, reject) => {
      amqp.connect(process.env.RABBITMQ_URL!, (err, connection) => {
        if (err) return reject(err);
        resolve(connection);
      });
    });

    const ch = await new Promise<Channel>((resolve, reject) => {
      conn.createChannel((err, channel) => {
        if (err) return reject(err);
        resolve(channel);
      });
    });

    await ch.assertExchange(EXCHANGE_NAME, "topic", { durable: false });

    connection = conn;
    channel = ch;

    logger.info(`Connected to RabbitMQ`);
    return ch;
  } catch (err) {
    logger.warn("Failed to connect to RabbitMQ", err);
    return null;
  }
}

export async function consumeEvent(
  routingKey: string,
  callback: (msgContent: any) => void
) {
  if (!channel) {
    await connectToRabbitMq();
  }

  if (!channel) {
    logger.warn("Cannot consume: channel is undefined");
    return;
  }

  const currentChannel = channel;

  currentChannel.assertQueue("", { exclusive: true }, (err, q) => {
    if (err) {
      logger.error("Error asserting queue", err);
      return;
    }

    currentChannel.bindQueue(q.queue, EXCHANGE_NAME, routingKey);

    currentChannel.consume(q.queue, (msg: Message | null) => {
      if (msg !== null) {
        const content = JSON.parse(msg.content.toString());
        callback(content);
        currentChannel.ack(msg);
      }
    });
  });
  logger.info(`Subscribed to event: ${routingKey}`);
}
