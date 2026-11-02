import amqp from "amqplib";

let channel: amqp.Channel;

export const connectRabbitMQ = async () => {
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
            password
        });

        channel = await connection.createChannel();

        console.log("RabbitMQ connected successfully");

    } catch (error) {
        console.error("Failed to connect RabbitMQ:", error);
        throw error;
    }
};

export const publishToQueue = async(queueName: string, message: any) => {
    if(!channel){
        console.log("rabbitmq channel is not initialize")
        return;
    }

    await channel.assertQueue(queueName, {durable: true})
    channel.sendToQueue(queueName, Buffer.from(JSON.stringify(message)), {
        persistent: true
    })
}