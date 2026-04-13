import mongoose from 'mongoose';

const companySchema = new mongoose.Schema({
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Admin que la creó
    name: { type: String, required: true },
    cif: { type: String, required: true, unique: true },
    address: {
        street: String,
        number: String,
        postal: String,
        city: String,
        province: String
    },
    logo: String, // URL de la imagen (Multer)
    isFreelance: { type: Boolean, default: false },
    deleted: { type: Boolean, default: false } // Soft delete
}, {
    timestamps: true
});

export const Company = mongoose.model('Company', companySchema);