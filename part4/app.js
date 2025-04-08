//Zili Bombach 214700148
// Run the application with: 'npm start' or 'node app.js'

const userRouter = require("./routes/userRoutes"); // User-related routes
const productRouter = require('./routes/productRoutes');//Products related routes
const  orderRouter= require('./routes/orderRoutes');//Orders related routes
const  inventoryRouter= require('./routes/inventoryRoutes');//Inventory related routes (Bonus)
const {requireLogin }= require('./middleware');//Middleware to ensure a user is logged in

const express = require('express')
const session = require("express-session");
const app = express();
const port = 3000

app.use("/grocery",express.static("public")); // Serve static files from the "public" directory, like CSS, JS, and images.
app.set("view engine", "ejs"); // Set EJS as the template engine for rendering HTML views.
app.use(express.urlencoded({ extended: true }));// Enable parsing of URL-encoded data and JSON payloads
app.use(express.json());

//user session for user identification 
app.use(
  session({
    secret: "supersecretkeyblabla",
    resave: false, 
    saveUninitialized: true, 
    cookie: { secure: false },
  })
);


app.get("/grocery", (req, res) => {
    res.render("pages/index");
  });

app.use("/grocery", userRouter); 
app.use("/grocery/products",requireLogin, productRouter);
app.use("/grocery/orders", requireLogin,orderRouter);
app.use("/grocery/inventory", requireLogin,inventoryRouter);


app.listen(port, () => {
  console.log(`app listening on port ${port}`)
})




const users = [
  { username: 'herzel', password: 'admin123' },//מנהל
  { username: 'freshfarms', password: 'farm123' },
  { username: 'superveggies', password: 'veggie123' },
  { username: 'dairydaily', password: 'milk123' },
  { username: 'foodIsGood', password: 'food123' }
];
