const pool = require('../config/db');
const bcrypt = require('bcrypt');

// Enregistrement utilisateur
const registerUser = async (req, res) => {
  const { nom, prenom, email, mot_de_passe, id_role } = req.body;

  try {
    // Générer un mot de passe chiffré
    const hashedPassword = await bcrypt.hash(mot_de_passe, 10);

    await pool.query(
      `INSERT INTO utilisateur (nom, prenom, email, mot_de_passe, id_role)
       VALUES ($1, $2, $3, $4, $5)`,
      [nom, prenom, email, hashedPassword, id_role]
    );

    res.status(201).json({ message: "Utilisateur enregistré avec succès." });
  } catch (err) {
    console.error("Erreur lors de l'enregistrement :", err);
    res.status(500).json({ message: "Erreur serveur lors de l'enregistrement." });
  }
};

// Connexion utilisateur
const loginUser = async (req, res) => {
  const { email, mot_de_passe } = req.body;

  try {
    const result = await pool.query(
      `SELECT * FROM utilisateur WHERE email = $1`,
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ message: "Email ou mot de passe incorrect" });
    }

    const utilisateur = result.rows[0];

    // Vérifier le mot de passe avec bcrypt
    const isPasswordValid = await bcrypt.compare(mot_de_passe, utilisateur.mot_de_passe);

    if (!isPasswordValid) {
      return res.status(401).json({ message: "Email ou mot de passe incorrect" });
    }

    res.json({ message: "Connexion réussie", utilisateur });
  } catch (err) {
    console.error("Erreur lors de la connexion :", err);
    res.status(500).json({ message: "Erreur serveur lors de la connexion." });
  }
};

module.exports = { registerUser, loginUser };
