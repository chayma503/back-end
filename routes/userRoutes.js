const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const pool = require('../config/db'); // Connexion PostgreSQL

// Route d'inscription
router.post('/register', async (req, res) => {
  const { nom, prenom, email, mot_de_passe, id_role } = req.body;

  try {
    // Vérifie si l'email existe déjà
    const existingUser = await pool.query('SELECT * FROM utilisateur WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ message: 'Cet email est déjà utilisé.' });
    }

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(mot_de_passe, 10);

    // Insérer l'utilisateur
    const newUser = await pool.query(
      `INSERT INTO utilisateur (nom, prenom, email, mot_de_passe, id_role)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [nom, prenom, email, hashedPassword, id_role]
    );

    res.status(201).json({ message: 'Utilisateur créé avec succès', user: newUser.rows[0] });
  } catch (err) {
    console.error('Erreur backend :', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

module.exports = router;
