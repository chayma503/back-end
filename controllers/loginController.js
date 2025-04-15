const pool = require('../config/db');
const bcrypt = require('bcrypt');

const loginUser = async (req, res) => {
  const { email, mot_de_passe } = req.body;

  if (!email) {
    return res.status(400).json({ message: "L'email est obligatoire", field: "email" });
  }
  if (!mot_de_passe) {
    return res.status(400).json({ message: "Le mot de passe est obligatoire", field: "mot_de_passe" });
  }

  try {
    // 🔁 ON FAIT UN JOIN pour récupérer le type du rôle
    const result = await pool.query(
      `SELECT utilisateur.*, role.type AS role 
       FROM utilisateur 
       JOIN role ON utilisateur.id_role = role.id 
       WHERE utilisateur.email = $1`,
      [email]
    );

    const user = result.rows[0];

    if (!user) {
      return res.status(400).json({ message: "Compte non trouvé", field: "email" });
    }

    const passwordMatch = await bcrypt.compare(mot_de_passe, user.mot_de_passe);

    if (!passwordMatch) {
      return res.status(400).json({ message: "Mot de passe incorrect", field: "mot_de_passe" });
    }

    // ✅ Ici, le champ "role" contient "Admin", "Modérateur" ou "Utilisateur"
    res.status(200).json({
      message: "Connexion réussie",
      user: {
        id: user.id,
        nom: user.nom,
        email: user.email,
        role: user.role // "Admin", etc.
      }
    });

  } catch (err) {
    console.error("Erreur serveur :", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

module.exports = { loginUser };