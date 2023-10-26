const express = require("express");
const admin = require("firebase-admin");

const app = express();
const port = 3000;

const serviceAccount = require("./node-service-account.json");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: 'https://psmwaterquality-default-rtdb.asia-southeast1.firebasedatabase.app',
});

const firestore = admin.firestore();
const { Timestamp } = admin.firestore;
const db = admin.database();

app.use(express.json());

// Root route
app.get('/', (req, res) => {
    res.send('Hello World!');
  });

  app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*"); // Allow requests from any origin
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
  });

  app.post('/sensor-data', (req, res) => {

    const {pH, turbidity} = req.body;
  
    // Input validation
    if(!pH || !turbidity) {
      return res.status(400).send("Invalid sensor data"); 
    }
  
    // Filter sensor values
    if(pH < 6.5 || pH > 14) {
      return res.status(400).send("Invalid pH value");
    }
  
    if(turbidity < -0 || turbidity > 50) {
      return res.status(400).send("Invalid turbidity value");  
    }
  
    // Send filtered values to Firebase
  
    const pHRef = db.ref('company_sensors/pH');
    pHRef.set(pH);
  
    const turbidityRef = db.ref('company_sensors/turbidity');
    turbidityRef.set(turbidity);
  
    res.send("Data filtered and saved");
  
  });

  app.use(express.json());

app.post("/send", async (req, res) => {
    try {
        const data = req.body;

        const docRef = firestore.collection("records").doc();

        data.timestamp = Timestamp.now(); // Automatically generate a timestamp

        await docRef.set(data);

        res.status(200).json({ success: "Data added to Firestore successfully." });
    } catch (error) {
        console.error("Error adding data to Firestore:", error);
        res.status(500).json({ error: "Data could not be added to Firestore." });
    }
});


app.post('/company_sensors', (req, res) => {
    const data = req.body;

    const ref = db.ref('company_sensors');

    ref.set(data, (error) => {
        if (error) {
            console.error('Error saving data to Realtime Database:', error);
            res.status(500).json({ error: 'Data could not be saved.' });
        } else {
            res.status(200).json({ success: 'Data saved to Realtime Database successfully.' });
        }
    });
});

app.post('/consumer_sensors', (req, res) => {
    const data = req.body;

    const ref = db.ref('consumer_sensors');

    ref.set(data, (error) => {
        if (error) {
            console.error('Error saving data to Realtime Database:', error);
            res.status(500).json({ error: 'Data could not be saved.' });
        } else {
            res.status(200).json({ success: 'Data saved to Realtime Database successfully.' });
        }
    });
});

app.use((err, _, res, __) => {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});