import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import app from "./app.js"


const PORT = process.env.PORT || 3001 

app.listen(PORT,()=>{

    console.log(`listening on ${PORT}..`)
})