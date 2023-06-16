const express = require("express");
const app = express();

app.use(express.json());
app.set("view engine", "html");
app.engine("html", require("ejs").renderFile);
app.use(express.static("./public"));

app.use("/", (req, res) => {
    res.render("index");
});

app.listen(3000, console.log("App is running at: ", 3000));
