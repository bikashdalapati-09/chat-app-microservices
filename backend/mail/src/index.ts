import express from 'express'
import dotenv from 'dotenv'
import { startOptConsumer } from './consumer.js'
dotenv.config()

const app = express()

const port = process.env.PORT || 3002

startOptConsumer()

app.listen(port, () => {
    console.log(`Mail Server is running on port ${port}`)
})