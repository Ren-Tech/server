const express = require("express");
const admin = require("firebase-admin");
const app = express();
const port = 3000;

const firebaseConfig = {
    apiKey: process.env.FIREBASE_API_KEY,
    authDomain: process.env.FIREBASE_AUTH_DOMAIN,
    projectId: process.env.FIREBASE_PROJECT_ID,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.FIREBASE_APP_ID,
};


const serviceAccount = require("./node-service-account.json");
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: process.env.FIREBASE_DATABASE_URL,
});

const firestore = admin.firestore();

app.use(express.json());

app.post("/send", async (req, res) => {
    try {
        const data = req.body;

        const docRef = firestore.collection("data").doc();

        await docRef.set(data);

        res.status(200).json({ success: "Data added to Firestore successfully." });
    } catch (error) {
        console.error("Error adding data to Firestore:", error);
        res.status(500).json({ error: "Data could not be added to Firestore." });
    }
});

app.use((err, _, res, __) => {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
