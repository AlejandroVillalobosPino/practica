import { Schema, model } from 'mongoose';

const clientSchema = new Schema({
    name: { type: String, required: true },
    cif: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: Number },
    address: {
        street: { type: String },
        city: { type: String },
        postalCode: { type: String },
        province: { type: String }
    },
    company: { type: Schema.Types.ObjectId, ref: 'Company', required: true }
}, { timestamps: true });

export default model('Client', clientSchema);