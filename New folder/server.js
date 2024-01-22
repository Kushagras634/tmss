const express=require('express');
port=3000
const db=require('./db.js');
const app=express();

const routes=require('./routes/task')

const userRoutes=require('./routes/user.js')
const body_parser=require('body-parser');
app.use(body_parser.json());
app.use('/tasks',routes);
app.use('/users',userRoutes);

app.listen(port, (error) =>{
    if(error){
        console.error(err);
    }
    console.log(`Connection on ${port}`);
});