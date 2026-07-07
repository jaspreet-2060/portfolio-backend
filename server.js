const express = require('express');
const mongoose = require('mongoose');
const nodemailer = require('nodemailer');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json()); // Frontend se aane wale JSON data ko read karne ke liye

// ========================================================
// 1. DATABASE CONFIGURATION (MongoDB Schema)
// ========================================================
const ContactSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String },
    purpose: { type: String, required: true },
    message: { type: String, required: true },
    date: { type: Date, default: Date.now }
});

const Contact = mongoose.model('Contact', ContactSchema); 

// MongoDB Database Connectivity
mongoose.connect(process.env.MONGODB_URI)
    .then(function() {
        console.log('Bhai, MongoDB Database successfully connect ho gaya! 🔥');
    })
    .catch(function(err) {
        console.error('Database connection crash error:', err);
    });

// ========================================================
// 2. EMAIL CONFIGURATION (Nodemailer System)
// ========================================================
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// 3. MAIN API ENDPOINT (POST Request)
app.post('/api/contact', async (req, res) => {
    try {
        const { name, email, phone, purpose, message } = req.body;

        // Validation Check
        if (!name || !email) {
            return res.status(400).json({ success: false, message: "Bhai, name aur email required hain!" });
        }

        // Action A: MongoDB Cloud Me Save Karna
        const newContact = new Contact({ name, email, phone, purpose, message });
        await newContact.save();
        console.log("Data saved to MongoDB Atlas! 💾");

        // Action B: Aapki Email ID Par Mail Trigger Karna (Safe Block)
        try {
            const mailOptions = {
                from: process.env.EMAIL_USER,
                to: process.env.EMAIL_USER, 
                subject: "📩 New Portfolio Message from " + name,
                text: "Bhai, portfolio par naya message aaya hai:\n\nName: " + name + "\nEmail: " + email + "\nPhone: " + phone + "\nPurpose: " + purpose + "\nMessage: " + message
            };

            await transporter.sendMail(mailOptions);
            console.log("Mail sent successfully! 📬");
        } catch (mailError) {
            // Agar Render mail block kare, toh sirf yahan log aayega, server crash nahi hoga
            console.error("Nodemailer side block (Render Network issue):", mailError.message);
        }

        // Frontend ko hamesha success response bhejna taaki "server failure" popup na aaye
        return res.status(200).json({ success: true, message: "Message sent successfully! 🎉" });

    } catch (error) {
        console.error("Main Server Error:", error);
        return res.status(500).json({ success: false, message: "Internal Server Error!" });
    }
});

// Server Listening setup (Direct Port 5000 fix)
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log('Backend Server running on port ${PORT}');
});