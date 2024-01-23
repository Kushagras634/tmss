const authMiddleware = require('../authenticate/authMIddleware');
const Task = require('../models/task');
const db = require('../db');
const { createClient } = require('redis')

const client = createClient(); // Create a single Redis client for reuse
client.on('error', (err) => console.error('Redis Client Error', err));


post = async (req, res) => {
    try {
        // if (!client.connected) {
        //     // Handle the case where the Redis client is not connected
        //     res.status(500).send('Redis connection error');
        //     return;
        // }
        await authMiddleware(req, res, async () => {
            const { task, completed, description, dueDate } = req.body;
            const userId = req.user._id;

            const dataObj = {
                task: task,
                completed: completed,
                owner: userId,
                description: description,
                dueDate: dueDate
            }

            const myTask = new Task(dataObj);

            const client = createClient();
            client.on('error', err => console.log('Redis Client Error', err));
            await client.connect();

            const taskId = myTask._id.toString(); // Get the generated task ID
            const taskData = myTask.toObject(); // Convert to plain object
            console.log(taskData);
            for (const key in taskData) {
                if (taskData.hasOwnProperty(key)) {
                    taskData[key] = taskData[key].toString();
                }
            }
            console.log(taskId)
            await client.hSet(`tasks:${taskId}`, taskData);

            await myTask.save();
            res.status(200).send("Task saved: " + task);
        });
    } catch (e) {
        console.log(e);
        res.status(400).send(e);
    }
};


getAll = async (req, res) => {
    try {
        console.log("fvfjvnfnvf");
        const client = createClient();
        client.on('error', err => console.log('Redis Client Error', err));
        await client.connect();
        // Check if tasks are in the cache
        const taskIds = (await client.SCAN('0')).keys;
        console.log("data", taskIds);

        if (taskIds.length > 0) {
            console.log("Cache Hit");

            const tasks = await Promise.all(taskIds.map(async (taskId) => {
                const taskData = await client.HGETALL(`${taskId}`);
                return taskData;
            }));
            res.status(200).send(tasks);
        } else {
            // ... f
            // If tasks are not in the cache, fetch from MongoDB
            const tasksFromMongo = await Task.find();

            if (tasksFromMongo.length > 0) {
                console.log("Cache Miss");

                // Add tasks to Redis
                // await client.set("tasks", JSON.stringify(tasksFromMongo));

                // Send the fetched tasks to the client
                res.status(200).send(tasksFromMongo);
            } else {
                // If no tasks are found in MongoDB, send an appropriate response
                console.log("No tasks in MongoDB");
                res.status(404).send("No Tasks Allotted");
            }
        }
    } catch (e) {
        console.error(e);
        res.status(500).send(e);
    }
};

get = async (req, res) => {
    const task_id = req.params.id;
    try {
        const task = await Task.findOne({ _id: task_id });
        if (!task) {
            return res.status(401).send({ error: "Task ID not found" });
        }
        res.send(task);
    } catch (e) {
        res.status(400).send(e);
    }
};

update = async (req, res) => {
    const updates = Object.keys(req.body);
    const allowedUpdates = ["task", "completed", "description"];
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update));
    if (!isValidOperation) {
        return res.status(400).send({ error: "Invalid updates" });
    }
    try {
        const task = await Task.findOne({
            _id: req.params.id,
            owner: req.user._id
        });
        if (!task) {
            return res.status(404).send({ error: "Task ID not found to update" });
        }
        updates.forEach((update) => (task[update] = req.body[update]));
        await task.save();

        // Clear the cache after updating a task
        client.del('tasks');

        res.send(task);
    } catch (e) {
        res.status(400).send(e);
    }
};

del = async (req, res) => {
    try {
        const task = await Task.findOneAndDelete({
            _id: req.params.id,
            owner: req.user._id
        });
        if (!task) {
            return res.status(404).send({ error: "Task ID not found" });
        }

        // Clear the cache after deleting a task
        client.del('tasks');

        res.send(task);
    } catch (e) {
        res.status(400).send({ e: "Catch Error", e });
    }
};

module.exports = { post, del, update, get, getAll };