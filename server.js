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

// ========================================================
// 3. MAIN API ENDPOINT (POST Request)
// ========================================================
app.post('/api/contact', async (req, res) => {
    try {
        const { name, email, phone, purpose, message } = req.body;

        // Validation Check
        if (!name || !email || !purpose || !message) {
            return res.status(400).json({ success: false, message: "Bhai, required fields fill karna zaroori hai!" });
        }

        // Action A: MongoDB Cloud Me Save Karna
        const newContact = new Contact({ name, email, phone, purpose, message });
        await newContact.save();

// Action B: Aapki Email ID Par Mail Trigger Karna
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: process.env.EMAIL_USER, // Message aapki apni mail id par hi aayega
            subject: "💼 New Portfolio Message: " + purpose + " from " + name,
            html: "<div style='font-family: Arial, sans-serif; padding: 20px; background-color: #f4f4f4;'>" +
                    "<div style='background-color: #0c0926; color: #ffffff; padding: 20px; border-radius: 8px;'>" +
                        "<h2 style='color: #a855f7; border-bottom: 2px solid rgba(168, 85, 247, 0.2); padding-bottom: 10px;'>New Portfolio Lead</h2>" +
                        "<p><strong>Name:</strong> " + name + "</p>" +
                        "<p><strong>Email:</strong> " + email + "</p>" +
                        "<p><strong>Phone:</strong> " + (phone || 'Not Provided') + "</p>" +
                        "<p><strong>Purpose:</strong> " + purpose + "</p>" +
                        "<div style='background-color: #110d33; padding: 15px; border-radius: 5px; margin-top: 15px;'>" +
                            "<p><strong>Message:</strong></p>" +
                            "<p>" + message + "</p>" +
                        "</div>" +
                    "</div>" +
                "</div>"
        };
        await transporter.sendMail(mailOptions);

        // Frontend ko success signal bhejna
        res.status(200).json({ success: true, message: "Success" });

    } catch (error) {
        console.error('System server error:', error);
        res.status(500).json({ success: false, message: "Server temporary failure!" });
    }
});

// Server Listening setup (Direct Port 5000 fix)
const PORT_NUMBER = 5000;
app.listen(PORT_NUMBER, function() {
    console.log('Backend Server running smoothly on port 5000 🚀');
});