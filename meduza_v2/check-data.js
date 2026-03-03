const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config({ path: ".env.local" });

// Importuj prawdziwe modele
const models = require("./src/models/index.js");
const User = models.User;
const Appointment = models.Appointment;
const Notification = models.Notification;

async function debugAppointments() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");

    // Sprawdź wszystkie wizyty używając prawdziwego modelu
    const allAppointments = await Appointment.find({});
    console.log("Wszystkie wizyty (prawdziwy model):", allAppointments.length);
    allAppointments.forEach((apt) => {
      console.log(
        `- ID: ${apt._id}, Date: ${apt.date}, Status: ${apt.status}, Time: ${apt.time}`
      );
    });

    // Sprawdź wizyty na dziś
    const today = new Date("2025-09-13");
    const tomorrow = new Date("2025-09-14");

    const todayAppointments = await Appointment.find({
      date: { $gte: today, $lt: tomorrow },
    });
    console.log("Wizyty na dziś:", todayAppointments.length);

    if (todayAppointments.length > 0) {
      todayAppointments.forEach((apt) => {
        console.log(`- ${apt.time} - ${apt.status}`);
      });
    }

    // Sprawdź powiadomienia
    const notifications = await Notification.find({});
    console.log("Wszystkie powiadomienia:", notifications.length);
    notifications.forEach((notif) => {
      console.log(
        `- ${notif.title}: ${notif.message} (${
          notif.read ? "przeczytane" : "nieprzeczytane"
        })`
      );
    });

    process.exit(0);
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

debugAppointments();
