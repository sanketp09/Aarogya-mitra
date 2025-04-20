// Load environment variables
require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from the dist directory
app.use(express.static(path.join(__dirname, 'dist')));

// Check for MongoDB URI
const uri = process.env.MONGODB_URI;
console.log("MongoDB URI availability:", uri ? "Available" : "Missing");

// Exit if no connection string is found
if (!uri) {
  console.error("MONGODB_URI is undefined. Please check your .env file.");
  process.exit(1);
}

// MongoDB Connection with specific options
mongoose
  .connect(uri, {
    dbName: "medicationReminder",
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Successfully connected to MongoDB Atlas"))
  .catch((err) => {
    console.error("MongoDB connection error:", err);
    process.exit(1); // Exit on connection failure
  });

// Import all schemas and routes from server.js
// Medication Schema
const medicationSchema = new mongoose.Schema({
  name: { type: String, required: true },
  dosage: String,
  frequency: String,
  time: { type: String, required: true },
  taken: { type: Boolean, default: false },
  userId: String, // For multi-user support
  createdAt: { type: Date, default: Date.now },
});

const Medication = mongoose.model("Medication", medicationSchema);

// Appointment Schema
const appointmentSchema = new mongoose.Schema({
  doctorId: { type: String, required: true },
  doctorName: { type: String, required: true },
  date: { type: String, required: true },
  time: { type: String, required: true },
  status: {
    type: String,
    required: true,
    enum: ["scheduled", "completed", "cancelled"],
    default: "scheduled",
  },
  userId: String, // For multi-user support
  createdAt: { type: Date, default: Date.now },
});

const Appointment = mongoose.model("Appointment", appointmentSchema);

// Emergency Contact Schema
const emergencyContactSchema = new mongoose.Schema({
  name: { type: String, required: true },
  relation: String,
  phone: { type: String, required: true },
  userId: String, // For multi-user support
  createdAt: { type: Date, default: Date.now },
});

const EmergencyContact = mongoose.model(
  "EmergencyContact",
  emergencyContactSchema
);

// Medication Routes
app.get("/api/medications", async (req, res) => {
  try {
    const medications = await Medication.find().sort({ createdAt: -1 });
    res.json(medications);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

app.post("/api/medications", async (req, res) => {
  try {
    const newMedication = new Medication(req.body);
    const savedMedication = await newMedication.save();
    res.status(201).json(savedMedication);
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: error.message });
  }
});

app.put("/api/medications/:id", async (req, res) => {
  try {
    const updatedMedication = await Medication.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!updatedMedication) {
      return res.status(404).json({ message: "Medication not found" });
    }

    res.json(updatedMedication);
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: error.message });
  }
});

app.delete("/api/medications/:id", async (req, res) => {
  try {
    const medication = await Medication.findByIdAndDelete(req.params.id);

    if (!medication) {
      return res.status(404).json({ message: "Medication not found" });
    }

    res.json({ message: "Medication deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
});

// Appointment Routes
app.get("/api/appointments", async (req, res) => {
  try {
    const appointments = await Appointment.find().sort({ createdAt: -1 });
    res.json(appointments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

app.post("/api/appointments", async (req, res) => {
  try {
    const newAppointment = new Appointment(req.body);
    const savedAppointment = await newAppointment.save();
    res.status(201).json(savedAppointment);
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: error.message });
  }
});

app.put("/api/appointments/:id", async (req, res) => {
  try {
    const updatedAppointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!updatedAppointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    res.json(updatedAppointment);
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: error.message });
  }
});

app.delete("/api/appointments/:id", async (req, res) => {
  try {
    const appointment = await Appointment.findByIdAndDelete(req.params.id);

    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    res.json({ message: "Appointment deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
});

// Emergency Contact Routes
app.get("/api/emergency-contacts", async (req, res) => {
  try {
    const contacts = await EmergencyContact.find().sort({ createdAt: -1 });
    res.json(contacts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

app.post("/api/emergency-contacts", async (req, res) => {
  try {
    const newContact = new EmergencyContact(req.body);
    const savedContact = await newContact.save();
    res.status(201).json(savedContact);
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: error.message });
  }
});

app.put("/api/emergency-contacts/:id", async (req, res) => {
  try {
    const updatedContact = await EmergencyContact.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!updatedContact) {
      return res.status(404).json({ message: "Emergency contact not found" });
    }

    res.json(updatedContact);
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: error.message });
  }
});

app.delete("/api/emergency-contacts/:id", async (req, res) => {
  try {
    const contact = await EmergencyContact.findByIdAndDelete(req.params.id);

    if (!contact) {
      return res.status(404).json({ message: "Emergency contact not found" });
    }

    res.json({ message: "Emergency contact deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
});

// For all other routes, serve the React app
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Start the server
app.listen(PORT, () => {
  console.log(`AROGYA MITRA server running on port ${PORT}`);
  console.log(`Server URL: http://localhost:${PORT}`);
}); 