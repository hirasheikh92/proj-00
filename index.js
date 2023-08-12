const express = require("express");
const users = require("./MOCK_DATA.json");
const fs = require("fs");
const mongoose = require("mongoose");

const app = express();
const PORT = 8000;

//connection
mongoose
  .connect("mongodb://127.0.0.1:27017/user-db-2")
  .then(() => console.log("Mongo db connected"))
  .catch((err) => console.log("Mongo Error,", err));

//Schema
const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    jobTitle: {
      type: String,
    },
    gender: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

//Model
const User = mongoose.model("user", userSchema);

//middleware
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  fs.appendFile(
    "log.txt",
    `\n${Date.now()}:${req.ip}:${req.path}`,
    (err, data) => {
      next();
    }
  );
});
app.use((req, res, next) => {
  //db query
  //credit card info
  req.creditCardNumber = "123";
  console.log(`hello from middleware 2 `, req.myUserName);
  next();
});

//ROUTES
app.get("/users", async (req, res) => {
  const allDbUsers = await User.find({});
  const html = `
    <ul>
    ${allDbUsers
      .map((user) => `<li>${user.firstName} -${user.email}</li>`)
      .join("")}
    </ul>`;
  res.send(html);
});

//REST API

app.get("/api/users/", async (req, res) => {
  const allDbUsers = await User.find({});
  // res.setHeader("X-MyName", "hira moueen"); //custom header
  //always add X to custom headers
  // console.log(req.headers);
  // res.setHeader("myName", "hira moueen");
  // console.log("i am in get route", req.myUserName);
  return res.json(allDbUsers);
});
app
  .route("/api/users/:id")
  .get(async (req, res) => {
    const user = await User.findById(req.params.id);
    // const id = Number(req.params.id);
    //find the user id
    // const user = users.find((user) => user.id === id);
    if (!user) {
      return res.status(404).json({ error: "user not found" });
    }
    return res.json(user);
  })
  .put((req, res) => {
    //edit user id
    return res.json({ status: "pending" });
  })
  .patch(async (req, res) => {
    await User.findByIdAndUpdate(req.params.id, { lastName: "changed" });
    //edit user id
    return res.json({ status: "succes" });
  })
  .delete(async (req, res) => {
    await User.findByIdAndDelete(req.params.id);
    return res.json({ status: "succsess" });
  });

app.post("/api/users", async (req, res) => {
  // todo: create new user
  const body = req.body;
  if (
    !body ||
    !body.first_name ||
    !body.last_name ||
    !body.email ||
    !body.gender ||
    !body.job_title
  ) {
    return res.status(400).json({ msg: "all fields are required" });
  }
  const result = await User.create({
    firstName: body.first_name,
    lastName: body.last_name,
    email: body.email,
    gender: body.gender,
    jobTitle: body.job_title,
  });
  // console.log(result);
  return res.status(201).json({ msg: "success" });
});

app.listen(PORT, () => console.log(`server started at PORT:${PORT}`));
