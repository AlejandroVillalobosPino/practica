import mongoose from 'mongoose';

const itemSchema = new mongoose.Schema({
    concept: { type: String, required: true },
    description: { type: String },
    quantity: { type: Number, required: true, min: 1 },
    hours: { type: Number, default: 0 }
});

const deliveryNoteSchema = new mongoose.Schema({
    deliveryNoteNumber: { type: String, required: true, unique: true, trim: true },
    company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
    client: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Client',
        required: [true, 'El albaran debe especificar un cliente']
    },
    project: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project',
        required: [true, 'El albaran debe especificar un proyecto']
    },
    date: { type: Date, default: Date.now, required: true },
    items: [itemSchema],
    status: {
        type: String,
        enum: ['PENDING_SIGNATURE', 'SIGNED', 'REJECTED'],
        default: 'PENDING_SIGNATURE'
    },
    signatureUrl: { type: String },
    pdfUrl: { type: String },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

export default mongoose.model('DeliveryNote', deliveryNoteSchema);