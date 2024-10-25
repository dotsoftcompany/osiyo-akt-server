const express = require("express");
const app = express();
const cors = require("cors");

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const admin = require("firebase-admin");
const credentials = require("./serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(credentials),
});

app.use((req, res, next) => {
  res.header(
    "Access-Control-Allow-Headers, *, Access-Control-Allow-Origin",
    "Origin, X-Requested-with, Content_Type, Accept, Authorization",
    "http://localhost:3000/add-teacher"
  );
  next();
});

app.post("/add-teacher", async (req, res) => {
  try {
    const user = {
      email: req.body.email,
      password: req.body.password,
      fullName: req.body.fullName,
      phone: req.body.phone,
      address: req.body.address,
      position: req.body.position,
      role: req.body.role,
      isTeacherUpdate: req.body.isTeacherUpdate,
    };

    // if (!email || !email.includes("@")) {
    //   return res.status(400).json({ message: "Invalid email format." });
    // }
    

    const userResponse = await admin.auth().createUser({
      email: user.email,
      password: user.password,
      emailVerified: false,
      disabled: false,
    });

    await admin
      .auth()
      .setCustomUserClaims(userResponse.uid, { role: "teacher" });

    await admin
      .firestore()
      .collection("teachers")
      .doc(userResponse.uid)
      .set({
        ...user,
        timestamp: new Date(),
        id: userResponse.uid,
      });

    res.status(201).json({
      message: "Teacher registered successfully",
      uid: userResponse.uid,
    });
    console.log("Teacher added successfully", res.status);
  } catch (error) {
    res
      .status(400)
      .json({ message: "Error registering teacher", error: error.message });
    console.log(error);
  }
});

const PORT = 8080;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
