const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    nom: {
      type: String,
      required: [true, 'Le nom est requis'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "L'email est requis"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/.+@.+\..+/, 'Email invalide'],
    },
    telephone: {
      type: String,
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Le mot de passe est requis'],
      minlength: 6,
      select: false,
    },
    role: {
      type: String,
      enum: ['admin', 'agent', 'candidate', 'employeur'],
      required: true,
    },
    actif: {
      type: Boolean,
      default: true,
    },
    // --- NOUVEAUX CHAMPS : VÉRIFICATION DOUCE (SOFT LOCK) ---
    emailVerifie: {
      type: Boolean,
      default: false,
    },
    codeVerification: String,
    expireAt: {
      type: Date,
      // MongoDB supprimera automatiquement le document quand cette date sera atteinte
    },
    // --------------------------------------------------------
    resetPasswordToken: String,
    resetPasswordExpire: Date,
  },
  { timestamps: true }
);

// Index TTL (Time To Live) : Détruit le document à la date exacte de `expireAt`
userSchema.index({ expireAt: 1 }, { expireAfterSeconds: 0 });

userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);