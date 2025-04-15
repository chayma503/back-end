const pool = require("../config/db");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
require("dotenv").config();

const resetPassword = async (req, res) => {
  const { token, newPassword } = req.body;

  if (!token || !newPassword) {
    return res.status(400).json({ message: "Token et nouveau mot de passe requis." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const email = decoded.email;

    if (!email) {
      return res.status(400).json({ message: "Token invalide : email manquant." });
    }

    console.log("Email extrait du token :", email);

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    const result = await pool.query(
      "UPDATE utilisateur SET mot_de_passe = $1 WHERE email = $2",
      [hashedPassword, email]
    );

    console.log("Nombre de lignes modifiées :", result.rowCount);

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Aucun utilisateur trouvé pour cet email." });
    }

    res.status(200).json({ message: "Mot de passe réinitialisé avec succès." });

  } catch (error) {
    console.error("Erreur lors de la réinitialisation du mot de passe :", error);
    res.status(400).json({ message: "Lien invalide ou expiré." });
  }
};

module.exports = { resetPassword };