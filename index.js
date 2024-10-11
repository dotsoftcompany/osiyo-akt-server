const express = require("express");
const app = express();
const cors = require("cors");

app.use(cors());
app.use(express.json());

app.use(express.urlencoded({ extended: true }));

const admin = require("firebase-admin");
const credentails = require("./serviceAccountKey.json");

app.use((req, res, next) => {
  res.header(
    "Access-Control-Allow-Headers, *, Access-Control-Allow-Origin",
    "Origin, X-Requested-with, Content_Type, Accept, Authorization",
    "http://localhost:3000/add-teacher"
  );
  next();
});

admin.initializeApp({
  credential: admin.credential.cert(credentails),
});

app.post("/add-teacher", async (req, res) => {
  try {
    const user = {
      email: req.body.email,
      password: req.body.password,
      name: req.body.name,
      surname: req.body.surname,
      phoneNumber: req.body.phoneNumber,
      address: req.body.address,
      freeUseEndDate: req.body.freeUseEndDate,
      timestamp: req.body.timestamp,
      uid: req.body.uid,
      photoUrl: req.body.photoUrl,
      status: req.body.status,
      role: req.body.role,
      sellPercent: req.body.sellPercent,
    };

    const userResponse = await admin.auth().createUser({
      email: user.email,
      password: user.password,
      emailVerified: false,
      disabled: false,
    });

    await admin
      .firestore()
      .collection("teachers")
      .doc(`${userResponse.uid}`)
      .set({
        name: user.name,
        surname: user.surname,
        email: user.email,
        address: user.address,
        phone: user.phoneNumber,
        curr: "USD",
        timestamp: new Date(),
        prefixtime: new Date().getTime(),
        freeUseEndDate: user.freeUseEndDate,
        payment: true,
        id: userResponse.uid,
        password: user.password,
        manageruid: user.uid,
        photoUrl: user.photoUrl,
        role: user.role,
        status: user.status,
        sellPercent: user.sellPercent,
      });
    res
      .status(201)
      .json({ message: "User registered successfully", uid: userResponse.uid });
  } catch (error) {
    res
      .status(400)
      .json({ message: "Error registering user", error: error.message });
    console.log(error);
  }
});

const PORT = 8080;

app.listen(PORT, () => {
  console.log("Server is running");
});
