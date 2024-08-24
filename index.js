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

app.get("/", (req,res) => {
    
    db.query("SELECT task FROM tasks", (err, result) => {
        if(err)
        {
            console.log("Error fetching data", err);
        }
        const data = result.rows;

        res.render("mainpage.ejs", {data});
    })

})




app.post("/addtask", (req,res) => {

    const addedtask = req.body.finaltask;
    db.query("INSERT INTO tasks(task) VALUES($1)", [addedtask]);
    res.redirect("/");

})


    


app.listen(port , () => {
    console.log(`server running on port ${port}`);
})