import DeliveryNote from '../models/DeliveryNote.js';
import Project from '../models/Project.js';
import { AppError } from '../utils/AppError.js';
import { uploadToCloudinary } from '../config/cloudinary.js';
import { generateDeliveryNotePDF } from '../services/pdf.service.js';
import { emitToCompany } from '../config/socket.js';

export const createDeliveryNote = async (req, res, next) => {
    try {
        const { project } = req.body;

        const existingProject = await Project.findOne({ _id: project, company: req.user.company });
        if (!existingProject) {
            return next(AppError.badRequest('El proyecto no es válido o no pertenece a tu compañía'));
        }

        const deliveryNoteNumber = `ALB-${Date.now()}`;
        const deliveryNote = await DeliveryNote.create({
            ...req.body,
            deliveryNoteNumber,
            company: req.user.company,
            createdBy: req.user.id
        });

        emitToCompany(req.user.company, 'deliverynote:new', deliveryNote);

        res.status(201).json(deliveryNote);
    } catch (error) { next(error); }
};

export const getDeliveryNotes = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const query = { company: req.user.company };
        if (req.query.project) query.project = req.query.project;
        if (req.query.client) query.client = req.query.client;
        if (req.query.status) query.status = req.query.status;

        if (req.query.from || req.query.to) {
            query.date = {};
            if (req.query.from) query.date.$gte = new Date(req.query.from);
            if (req.query.to) query.date.$lte = new Date(req.query.to);
        }

        const sort = req.query.sort ? req.query.sort.split(',').join(' ') : '-date';

        const deliveryNotes = await DeliveryNote.find(query)
            .sort(sort)
            .skip(skip)
            .limit(limit)
            .populate('client', 'name cif')
            .populate('project', 'name projectCode')
            .populate('createdBy', 'name email');

        const totalItems = await DeliveryNote.countDocuments(query);

        res.json({
            data: deliveryNotes,
            currentPage: page,
            totalPages: Math.ceil(totalItems / limit),
            totalItems
        });
    } catch (error) { next(error); }
};

export const getDeliveryNote = async (req, res, next) => {
    try {
        const deliveryNote = await DeliveryNote.findOne({ _id: req.params.id, company: req.user.company })
            .populate('client').populate('project').populate('createdBy', 'name email');
        if (!deliveryNote) return next(AppError.notFound('Albarán no encontrado'));
        res.json(deliveryNote);
    } catch (error) { next(error); }
};

export const signDeliveryNote = async (req, res, next) => {
    try {
        const deliveryNote = await DeliveryNote.findOne({ _id: req.params.id, company: req.user.company });
        if (!deliveryNote) return next(AppError.notFound('Albarán no encontrado'));
        if (deliveryNote.status === 'SIGNED') return next(AppError.badRequest('Ya está firmado'));
        if (!req.file) return next(AppError.badRequest('Falta la imagen de la firma'));

        const signatureUrl = await uploadToCloudinary(req.file.buffer);
        deliveryNote.status = 'SIGNED';
        deliveryNote.signatureUrl = signatureUrl;
        await deliveryNote.save();

        emitToCompany(req.user.company, 'deliverynote:signed', deliveryNote);

        res.json({ message: 'Albarán firmado con éxito', signatureUrl });
    } catch (error) { next(error); }
};

export const downloadPDF = async (req, res, next) => {
    try {
        const deliveryNote = await DeliveryNote.findOne({ _id: req.params.id, company: req.user.company })
            .populate('client', 'name').populate('project', 'name');
        if (!deliveryNote) return next(AppError.notFound('Albarán no encontrado'));

        const pdfBuffer = await generateDeliveryNotePDF(deliveryNote);
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=albaran_${deliveryNote.deliveryNoteNumber}.pdf`);
        res.send(pdfBuffer);
    } catch (error) { next(error); }
};

export const deleteDeliveryNote = async (req, res, next) => {
    try {
        const deliveryNote = await DeliveryNote.findOne({ _id: req.params.id, company: req.user.company });
        if (!deliveryNote) return next(AppError.notFound('Albarán no encontrado'));
        if (deliveryNote.status === 'SIGNED') return next(AppError.badRequest('No se puede borrar un albarán firmado'));
        await DeliveryNote.findByIdAndDelete(req.params.id);
        res.status(204).send();
    } catch (error) { next(error); }
};