const express = require('express');
const bodyParser = require('body-parser');

const pg = require('pg');
require('dotenv').config();

const app = express();
const port = 3000;

const db = new pg.Client({
    user: process.env.DB_USERNAME,
    host: "localhost",
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: 5432,
});

db.connect();

app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended:true}));

app.get("/index", (req, res) =>{
    res.render("index.ejs");

});

app.get("/", (req, res) => {
    db.query("SELECT task_id, task, status, created_at FROM tasks", (err, result) => {
        if (err) {
            console.log("Error fetching data", err);
            res.status(500).send("Error fetching tasks");
        } else {
            const data = result.rows;
            res.render("mainpage.ejs", { data });
        }
    });
});


app.post("/addtask", (req,res) => {

    const addedtask = req.body.finaltask;
    db.query("INSERT INTO tasks(task) VALUES($1)", [addedtask]);
    res.redirect("/");

})

app.post("/delete/:task_id", (req, res) => {
    const taskId = req.params.task_id;

    db.query("DELETE FROM tasks WHERE task_id = $1", [taskId], (err, result) => {
        if (err) {
            console.log("Error deleting task", err);
            res.status(500).send("Error deleting task");
        } else {
            res.redirect("/");
        }
    });
});

app.post("/complete/:task_id", (req, res) => {
    const taskId = req.params.task_id;

    db.query("UPDATE tasks SET status = 'completed' WHERE task_id = $1", [taskId], (err, result) => {
        if (err) {
            console.log("Error updating task", err);
            res.status(500).send("Error updating task");
        } else {
            res.redirect("/");
        }
    });
});


function deleteOldTasks() {
    db.query("DELETE FROM tasks WHERE created_at < NOW() - INTERVAL '24 hours'", (err, result) => {
        if (err) {
            console.log("Error deleting old tasks", err);
        } else {
            console.log("Old tasks deleted successfully");
        }
    });
}


setInterval(deleteOldTasks, 60 * 60 * 1000);










    


app.listen(port , () => {
    console.log(`server running on port ${port}`);
})