import Client from '../models/Client.js';
import { AppError } from '../utils/AppError.js';
import { emitToCompany } from '../config/socket.js';

export const createClient = async (req, res, next) => {
    try {
        const { cif } = req.body;
        const existingClient = await Client.findOne({ cif, company: req.user.company });
        if (existingClient) return next(AppError.conflict('Ya existe un cliente con este CIF en tu compañia'));

        const client = await Client.create({
            ...req.body,
            company: req.user.company,
            createdBy: req.user.id
        });

        emitToCompany(req.user.company, 'client:new', client);
        res.status(201).json(client);
    } catch (error) { next(error); }
};

export const getClients = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const query = { company: req.user.company, deleted: { $ne: true } };
        if (req.query.name) query.name = { $regex: req.query.name, $options: 'i' };

        const sort = req.query.sort ? req.query.sort.split(',').join(' ') : '-createdAt';

        const clients = await Client.find(query).sort(sort).skip(skip).limit(limit);
        const totalItems = await Client.countDocuments(query);

        res.json({ data: clients, currentPage: page, totalPages: Math.ceil(totalItems / limit), totalItems });
    } catch (error) { next(error); }
};

export const getClient = async (req, res, next) => {
    try {
        const client = await Client.findOne({ _id: req.params.id, company: req.user.company });
        if (!client) return next(AppError.notFound('Cliente no encontrado'));
        res.json(client);
    } catch (error) { next(error); }
};

export const updateClient = async (req, res, next) => {
    try {
        const client = await Client.findOneAndUpdate(
            { _id: req.params.id, company: req.user.company },
            { ...req.body },
            { new: true, runValidators: true }
        );
        if (!client) return next(AppError.notFound('Cliente no encontrado'));
        res.json(client);
    } catch (error) { next(error); }
};

export const deleteClient = async (req, res, next) => {
    try {
        const { soft } = req.query;
        if (soft === 'true') {
            const client = await Client.findOneAndUpdate(
                { _id: req.params.id, company: req.user.company },
                { deleted: true },
                { new: true }
            );
            if (!client) return next(AppError.notFound('Cliente no encontrado'));
            return res.json({ message: 'Cliente archivado correctamente' });
        } else {
            const client = await Client.findOneAndDelete({ _id: req.params.id, company: req.user.company });
            if (!client) return next(AppError.notFound('Cliente no encontrado'));
            return res.status(204).send();
        }
    } catch (error) { next(error); }
};

export const getArchivedClients = async (req, res, next) => {
    try {
        const clients = await Client.find({ company: req.user.company, deleted: true });
        res.json(clients);
    } catch (error) { next(error); }
};

export const restoreClient = async (req, res, next) => {
    try {
        const client = await Client.findOneAndUpdate(
            { _id: req.params.id, company: req.user.company, deleted: true },
            { deleted: false },
            { new: true }
        );
        if (!client) return next(AppError.notFound('Cliente archivado no encontrado'));
        res.json({ message: 'Cliente restaurado correctamente', client });
    } catch (error) { next(error); }
};