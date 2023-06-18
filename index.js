const express = require("express");
const app = express();
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const cookieParser = require("cookie-parser");
const multer = require("multer");
const User = require("./models/uesrs");
const Product = require("./models/products");

mongoose
    .connect(
        "mongodb+srv://booking:westuni@cluster0.3sntgjf.mongodb.net/?retryWrites=true&w=majority",
    )
    .then((res) => {
        console.log("Mongodb connected...");
    })
    .catch((err) => {
        console.log("mongoERR:", err);
    });

app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.set("view engine", "html");
app.engine("html", require("ejs").renderFile);
app.use(express.static("./public"));

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "public/img/upload/");
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + "-" + file.originalname);
    },
});

const upload = multer({ storage });

app.get("/", async (req, res) => {
    const { minPrice, maxPrice, numRooms } = req.query;

    var products = await Product.find();

    if (minPrice) {
        products = products.filter((e) => e.price > minPrice);
    }

    if (maxPrice) {
        products = products.filter((e) => e.price <= maxPrice);
    }

    if (numRooms) {
        products = products.filter((e) => e.rooms === numRooms);
    }

    res.render("index", { data: products });
});

app.get("/detail/:id", async (req, res) => {
    const product = await Product.findById(req.params.id);
    res.render("detail", {
        product,
    });
});

app.get("/login", (req, res) => {
    res.render("login", { error: false });
});

app.get("/register", (req, res) => {
    res.render("register", {
        error: false,
    });
});

app.get("/logout", (req, res) => {
    res.cookie("username", "");
    res.redirect("/");
});

app.get("/dashboard", async (req, res) => {
    if (req.cookies.username === "admin") {
        const products = await Product.find();
        res.render("dashboard", { data: products });
    } else {
        res.redirect("/");
    }
});

app.post("/login", async (req, res) => {
    const { password } = req.body;
    const login = req.body.login.toLowerCase();

    // Find the user by username
    const user = await User.findOne({ login });
    console.log(user);
    // Check if the user exists
    if (!user) {
        res.render("login", { error: true });
        return;
    }

    // Compare the provided password with the hashed password
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
        res.render("login", { error: true });
        return;
    }
    res.cookie("username", login);

    res.redirect("/");
});

app.post("/register", async (req, res) => {
    const password = req.body.password;
    const login = req.body.login.toLowerCase();
    const email = req.body.email || "";
    // Check if the username already exists
    const existingUser = await User.findOne({ login });
    if (existingUser) {
        res.render("register", { error: true });
        return;
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create a new user
    const newUser = new User({ login, password: hashedPassword, email });
    await newUser.save();

    res.redirect("/login");
});

app.get("/delete/:id", async (req, res) => {
    await Product.findOneAndDelete({
        _id: req.params.id,
    });

    res.redirect("/dashboard");
});

app.post("/dashboard", upload.single("image"), async (req, res) => {
    const { name, price, address, area, rooms, tell } = req.body;
    const imagePath = req.file ? req.file.path : "";

    const property = new Product({
        name,
        price,
        img: imagePath,
        address,
        area,
        rooms,
        tell,
    });

    await property.save();
    res.redirect("/dashboard");
});

app.listen(3000, console.log("App is running at: ", 3000));
