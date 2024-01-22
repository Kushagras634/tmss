const express=require('express');
const router=express.Router();
const authMiddleware = require('../authenticate/authMIddleware');

const {post,del,update,get,getAll}=require('../controller/task');

router.post('/',authMiddleware,post);
router.get('/',authMiddleware,getAll);
router.get('/:id',authMiddleware,get);
router.patch('/:id',authMiddleware,update);
router.delete('/:id',authMiddleware,del);;

module.exports=router;
