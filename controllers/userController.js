const pool = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
require('dotenv').config();

// Fonction pour envoyer un email de vérification
const sendVerificationEmail = async (email, token) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,      // ton adresse Gmail
      pass: process.env.EMAIL_PASS       // mot de passe ou app password
    }
  });

  const verificationLink = `http://localhost:5000/api/users/verify/${token}`;

  await transporter.sendMail({
    from: `"Vérification" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Vérification de votre adresse e-mail',
    html: `<p>Merci de vous être inscrit. Veuillez cliquer sur ce lien pour vérifier votre email :</p>
           <a href="${verificationLink}">${verificationLink}</a>`
  });
};

// ==================== ENREGISTREMENT ====================
const registerUser = async (req, res) => {
  const { nom, prenom, email, mot_de_passe, confirmer_mot_de_passe, id_role } = req.body;

  try {
    if (!nom || !prenom || !email || !mot_de_passe || !confirmer_mot_de_passe || !id_role) {
      return res.status(400).json({ message: "Tous les champs sont obligatoires." });
    }

    // Vérification si email déjà utilisé
    const existingUser = await pool.query('SELECT * FROM utilisateur WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ field: 'email', message: 'Cet email est déjà utilisé.' });
    }

    if (mot_de_passe !== confirmer_mot_de_passe) {
      return res.status(400).json({ message: "Les mots de passe ne correspondent pas." });
    }

    // Hash du mot de passe
    const hashedPassword = await bcrypt.hash(mot_de_passe, 10);

    // Création de l'utilisateur (non vérifié)
    const result = await pool.query(
      `INSERT INTO utilisateur (nom, prenom, email, mot_de_passe, id_role, is_verified)
       VALUES ($1, $2, $3, $4, $5, false) RETURNING *`,
      [nom, prenom, email, hashedPassword, id_role]
    );

    const user = result.rows[0];

    // Générer un token de vérification
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '1d' });
    console.log("Token généré : ", token);

    // Envoyer l'email
    await sendVerificationEmail(email, token);

    res.status(201).json({ message: 'Compte créé avec succès. Veuillez vérifier votre email.' });
  } catch (err) {
    console.error("Erreur backend :", err);
    res.status(500).json({ message: "Erreur serveur." });
  }
};

// ==================== VÉRIFICATION EMAIL ====================
const verifyEmail = async (req, res) => {
  const { token } = req.params;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.userId;

    const result = await pool.query(
      'UPDATE utilisateur SET is_verified = true WHERE id = $1 RETURNING *',
      [userId]
    );
    console.log("Résultat de la mise à jour : ", result.rows);
    

    res.status(200).send("Email vérifié avec succès !");
  } catch (err) {
    console.error("Erreur de vérification :", err);
    res.status(400).send("Lien invalide ou expiré.");
  }
};

module.exports = {
  registerUser,
  verifyEmail
};
