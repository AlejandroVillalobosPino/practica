import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true, select: false }, // No se devuelve en los GET por defecto
    name: String,
    lastName: String,
    nif: String,
    role: { type: String, enum: ['admin', 'guest'], default: 'admin' }, //
    status: { type: String, enum: ['pending', 'verified'], default: 'pending' },
    verificationCode: String,
    verificationAttempts: { type: Number, default: 3 },
    company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' }, //
    address: { street: String, number: String, postal: String, city: String, province: String },
    deleted: { type: Boolean, default: false } // Requisito T6
}, {
    timestamps: true,
    toJSON: { virtuals: true }, // Para que el virtual fullName aparezca en el JSON
    toObject: { virtuals: true }
});

// Virtual para fullName: name + lastName
userSchema.virtual('fullName').get(function() {
    return `${this.name} ${this.lastName}`;
});

// Índices recomendados para acelerar consultas frecuentes
userSchema.index({ company: 1 });
userSchema.index({ status: 1 });
userSchema.index({ role: 1 });

export const User = mongoose.model('User', userSchema);