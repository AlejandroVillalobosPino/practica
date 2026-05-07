import mongoose from 'mongoose';

// Subesquema para los ítems del albarán
const itemSchema = new mongoose.Schema({
    concept: { type: String, required: true },
    description: { type: String },
    quantity: { type: Number, required: true, min: 1 },
    hours: { type: Number, default: 0 } // Por si es albarán de horas
});

const deliveryNoteSchema = new mongoose.Schema({
    deliveryNoteNumber: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    client: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Client',
        required: [true, 'El albarán debe especificar un cliente']
    },
    project: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project',
        required: [true, 'El albarán debe especificar un proyecto']
    },
    date: {
        type: Date,
        default: Date.now,
        required: true
    },
    items: [itemSchema], // Array de conceptos/trabajos realizados

    // Estado de la firma y archivo
    status: {
        type: String,
        enum: ['PENDING_SIGNATURE', 'SIGNED', 'REJECTED'],
        default: 'PENDING_SIGNATURE'
    },
    signatureUrl: { type: String }, // URL de la imagen de la firma (Cloudinary)
    pdfUrl: { type: String }, // URL del PDF final generado

    // Tracking
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, {
    timestamps: true
});

const DeliveryNote = mongoose.model('DeliveryNote', deliveryNoteSchema);

export default DeliveryNote;