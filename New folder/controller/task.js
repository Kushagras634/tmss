//const redis = require('redis');
//const client = redis.createClient();
//const cacheMiddleware = require('../authenticate/cacheMiddleware');
    
const authMiddleware = require('../authenticate/authMIddleware');
const Task = require('../models/task');

// // Middleware to cache the list of tasks
// const cacheMiddleware = (req, res, next) => {
//     client.get('tasks', (err, data) => {
//         if (err) throw err;

//         if (data !== null) {
//             console.log('Data from cache');
//             res.send(JSON.parse(data));
//         } else {
//             next();
//         }
//     });
// };

post = async (req, res) => {
   try {
        // Use the authMiddleware to authenticate and get user data
        await authMiddleware(req, res, async () => {
            const { task, completed, description, dueDate } = req.body;

            // You can now access user data using req.user
            const userId = req.user._id;
            console.log("pst", userId)

            const myTask = new Task({
                task: task,
                completed: completed,
                owner: userId,
                description: description,
                dueDate: dueDate
            });

            console.log(task);

            // Save the task to the database
            await myTask.save();

            // Clear the cache after adding a new task
            // client.del('tasks');

            res.status(200).send("Task saved: " + task);
        });
    } catch (e) {
        console.log(e)
        res.status(400).send(e);
    }
};

getAll = async (req, res) => {
    try {
        const tasks = await Task.find();
        console.log(tasks);
        
        // Cache the list of tasks
        //client.setex('tasks', 3600, JSON.stringify(tasks));

        return res.status(200).send(tasks);
    } catch (e) {
        res.status(500).send(e);
    }
};
get = async(req,res)=>{
    console.log("GET runs")
    const task_id=req.params.id;
    try{
        const task=await Task.findOne({_id: task_id});
        if(!task){
            return res.status(401).send({error:"Task ID not found"});
        }
        res.send(task);
    }catch(e){
        res.status(400).send(e);
    }
}

// update =  async (req,res) =>{
//     const updates= Object.keys(req.body);
//     const allowedUpdates=["Task","completed","description"];
//     const isValidOperation=updates.every((update) => allowedUpdates.includes(update));
//     if(!isValidOperation){
//         return res.status(400).send({error:"Invalid updates"});
//     }
//     try{
//         const task=await Task.findOne({
//             _id:req.params.id,
//              owner:req.user._id
//         });
//         if(!task){
//             res.send({error:"Task ID not found to update"});
//         }
//         updates.forEach((update)=>(task[update]=req.body[update]));
//         await task.save();
//         res.send(task);
//     }catch(e){
//         res.status(400).send(e);
//     }
// }

update =  async (req,res) =>{
    const updates= Object.keys(req.body);
    console.log(updates);
    const allowedUpdates=["task","completed","description"];
    const isValidOperation=updates.every((update) => allowedUpdates.includes(update));
    if(!isValidOperation){
        return res.status(400).send({error:"Invalid updates"});
    }
    try{
        const task=await Task.findOne({
            _id:req.params.id,
             owner:req.user._id
        });
        if(!task){
            res.send({error:"Task ID not found to update"});
        }
        updates.forEach((update)=>(task[update]=req.body[update]));
        await task.save();
        res.send(task);
    }catch(e){
        res.status(400).send(e);
    }
}

del =  async (req,res)=>{   
    try{
        const task=await Task.findOneAndDelete({
            _id:req.params.id,
            owner:req.user._id
        });
        if(!task){
            res.status(400).send({error: "Task ID not found"});
        }
        res.send(task);
    }catch(e){
        res.status(400).send({e:"Catch Error",e});
    }
}
module .exports={post,del,update,get,getAll};