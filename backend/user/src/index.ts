import express from 'express'
import dotenv from 'dotenv'
import connectDB from './config/db.js';
dotenv.config()
import {createClient} from 'redis'
import userRoutes from './routes/userRouter.js'
import { connectRabbitMQ } from './config/rabitmq.js';
import cors from 'cors'



const app = express();
app.use(cors())
app.use(express.json())

app.use("/api/v1", userRoutes)

connectDB();
connectRabbitMQ();
const redisUrl = process.env.REDIS_URL
if (!redisUrl) {
    throw new Error('REDIS_URL is not configured')
}

export const redisClient = createClient({
    url: redisUrl,
})

redisClient.connect().then(() => console.log("connected to redis")).catch(console.error)

const port = process.env.PORT || 3001

app.listen(port, () => {
    console.log(`server is running on port ${port}`)
})