import amqp from "amqplib";
import logger from "./logger";

let connection = null;
let channel: any = null;

const EXCHANGE_NAME = "social_media_events";

export async function connectToRabbitMq() {
  try {
    connection = await amqp.connect(process.env.RABBITMQ_URL!);
    channel = await connection.createChannel();

    await channel.assertExchange(EXCHANGE_NAME, "topic", { durable: false });
    logger.info(`Connected to RabbitMq `);

    return channel;
  } catch (error) {
    logger.warn(`Error connecting to rabbit mq`, error);
  }
}

export async function publishEvent(routingKey : string, message:unknown) {
  if (!channel) {
    await connectToRabbitMq();
  }
  channel.publish(
    EXCHANGE_NAME,
    routingKey,
    Buffer.from(JSON.stringify(message))
  );
  logger.info(`Event Published: ${routingKey}`);
}
