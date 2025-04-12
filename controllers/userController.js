const pool = require('../config/db');
const bcrypt = require('bcrypt');

// Fonction d'enregistrement
const registerUser = async (req, res) => {
  const { nom, prenom, email, mot_de_passe, confirmer_mot_de_passe, id_role } = req.body;
try{
  
   // 1. Vérifier que tous les champs sont remplis
   if (!nom || !prenom || !email || !mot_de_passe || !confirmer_mot_de_passe || !id_role) {
    return res.status(400).json({ message: "Tous les champs sont obligatoires." });
  }
  else{

  
    // 2. Vérifier si l'email existe déjà
    const existingUser = await pool.query('SELECT * FROM utilisateur WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ message: 'Cet email est déjà utilisé.' });
    }
     

    // 3. Vérifier que les mots de passe sont identiques
    if (mot_de_passe !== confirmer_mot_de_passe) {
      return res.status(400).json({ message: "Les mots de passe ne correspondent paaaaaaaaaaaaaas." });
    }
  }
    const hashedPassword = await bcrypt.hash(mot_de_passe, 10);

    const newUser = await pool.query(
      `INSERT INTO utilisateur (nom, prenom, email, mot_de_passe, id_role)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [nom, prenom, email, hashedPassword, id_role]
    );

    res.status(201).json({ message: 'Utilisateur créé avec succès', user: newUser.rows[0] });
  }catch (err) {
    console.error('Erreur backend :', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

module.exports = { registerUser };


