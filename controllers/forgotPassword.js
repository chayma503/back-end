const pool = require("../config/db");
const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const sendResetEmail = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Email requis." });
  }

  try {
    const result = await pool.query("SELECT * FROM utilisateur WHERE email = $1", [email]);
    const user = result.rows[0];

    if (!user) {
      return res.status(404).json({ message: "Aucun utilisateur avec cet email." });
    }

    // ✅ Correction : mettre l'email dans le token
    const token = jwt.sign({ email: user.email }, process.env.JWT_SECRET, { expiresIn: '1h' });
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${token}`;

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: "Réinitialisation de mot de passe",
      html: `
        <h3>Bonjour ${user.nom},</h3>
        <p>Vous avez demandé une réinitialisation de votre mot de passe.</p>
        <a href="${resetUrl}">Cliquez ici pour réinitialiser</a>
        <p>Ce lien expire dans 1 heure.</p>
      `,
    };

    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: "Lien de réinitialisation envoyé à l'adresse email." });

  } catch (error) {
    console.error("Erreur lors de l'envoi de l'email :", error);
    res.status(500).json({ message: "Erreur serveur." });
  }
};

module.exports = { sendResetEmail };