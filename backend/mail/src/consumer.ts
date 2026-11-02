import amqp from "amqplib";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

export const startOptConsumer = async () => {
  try {
    const host = process.env.RABBITMQ_HOST;
    const username = process.env.RABBITMQ_USERNAME;
    const password = process.env.RABBITMQ_PASSWORD;

    if (!host || !username || !password) {
      throw new Error("RabbitMQ environment variables are missing");
    }

    const connection = await amqp.connect({
      protocol: "amqp",
      hostname: host,
      port: 5672,
      username,
      password,
    });

    const channel = await connection.createChannel();

    const queuename = "send-otp";
    await channel.assertQueue(queuename, { durable: true });

    console.log("mail consumer rabbitmq started, listening for otp");
    channel.consume(queuename, async (msg) => {
      if (msg) {
        try {
          const { to, subject, body } = JSON.parse(msg.content.toString());
          const transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 465,
            auth: {
              user: process.env.USER,
              pass: process.env.PASS,
            },
          });
          await transporter.sendMail({
            from: "chat-app",
            to,
            subject,
            text: body
          })
          console.log(`mail sent to ${to}`)
          channel.ack(msg)
        } catch (error) {
            console.log("failed to sent otp", error)
        }
      }
    });
  } catch (error) {
    console.log("failed start rabbitmq consumer", error);
  }
};
