import express from "express";

const router=express.Router();

router.get('/signup',(req,res)=>{
    res.send('POST /api/auth/signup response');
});
router.get('/signin',(req,res)=>{
    res.send('POST /api/auth/signin response');
});
router.get('/signout',(req,res)=>{
    res.send('POST /api/auth/signout response');
});

export default router;