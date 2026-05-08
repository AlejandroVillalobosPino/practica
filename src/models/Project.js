import { Schema, model } from 'mongoose';

const projectSchema = new Schema({
    name: { type: String, required: true },
    projectCode: { type: String, required: true, unique: true },
    client: { type: Schema.Types.ObjectId, ref: 'Client', required: true },
    company: { type: Schema.Types.ObjectId, ref: 'Company', required: true },
    status: {
        type: String,
        enum: ['PLANNING', 'ACTIVE', 'COMPLETED', 'ARCHIVED'],
        default: 'PLANNING'
    },
    deleted: { type: Boolean, default: false }
}, { timestamps: true });

export default model('Project', projectSchema);