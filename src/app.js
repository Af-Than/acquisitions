import express from 'express'
const app = express()
const PORT = process.env.PORT || 3001 

app.get("/",(req,res)=>{
    res.send("hello from the acquisitions microservice")
})