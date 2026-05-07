import Project from '../models/Project.js';
import { AppError } from '../utils/AppError.js';

export const createProject = async (req, res, next) => {
    try {
        const { projectCode } = req.body;

        const existing = await Project.findOne({ projectCode, company: req.user.company });
        if (existing) return next(AppError.conflict('Ya existe un proyecto con ese código en tu compañía'));

        const project = await Project.create({
            ...req.body,
            company: req.user.company,
            createdBy: req.user.id
        });

        res.status(201).json(project);
    } catch (error) { next(error); }
};

export const getProjects = async (req, res, next) => {
    try {
        const companyId = req.user?.company;
        if (!companyId) return res.json({ data: [] });

        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const query = { company: companyId, deleted: { $ne: true } };
        if (req.query.client) query.client = req.query.client;
        if (req.query.name) query.name = { $regex: req.query.name, $options: 'i' };
        if (req.query.active) query.active = req.query.active === 'true';

        const sort = req.query.sort ? req.query.sort.split(',').join(' ') : '-createdAt';

        const projects = await Project.find(query)
            .sort(sort)
            .skip(skip)
            .limit(limit)
            .populate('client', 'name cif');

        const totalItems = await Project.countDocuments(query);

        res.json({
            data: projects,
            currentPage: page,
            totalPages: Math.ceil(totalItems / limit),
            totalItems
        });
    } catch (error) { next(error); }
};

export const getProject = async (req, res, next) => {
    try {
        const project = await Project.findOne({ _id: req.params.id, company: req.user.company })
            .populate('client', 'name cif');
        if (!project) return next(AppError.notFound('Proyecto no encontrado'));
        res.json(project);
    } catch (error) { next(error); }
};

export const updateProject = async (req, res, next) => {
    try {
        const project = await Project.findOneAndUpdate(
            { _id: req.params.id, company: req.user.company },
            { ...req.body, updatedBy: req.user.id },
            { new: true, runValidators: true }
        );
        if (!project) return next(AppError.notFound('Proyecto no encontrado'));
        res.json(project);
    } catch (error) { next(error); }
};

export const deleteProject = async (req, res, next) => {
    try {
        const { soft } = req.query;
        if (soft === 'true') {
            const project = await Project.findOneAndUpdate(
                { _id: req.params.id, company: req.user.company },
                { deleted: true, updatedBy: req.user.id },
                { new: true }
            );
            if (!project) return next(AppError.notFound('Proyecto no encontrado'));
            return res.json({ message: 'Proyecto archivado correctamente' });
        } else {
            const project = await Project.findOneAndDelete({ _id: req.params.id, company: req.user.company });
            if (!project) return next(AppError.notFound('Proyecto no encontrado'));
            return res.status(204).send();
        }
    } catch (error) { next(error); }
};

export const getArchivedProjects = async (req, res, next) => {
    try {
        const projects = await Project.find({ company: req.user.company, deleted: true });
        res.json({ data: projects });
    } catch (error) { next(error); }
};

export const restoreProject = async (req, res, next) => {
    try {
        const project = await Project.findOneAndUpdate(
            { _id: req.params.id, company: req.user.company, deleted: true },
            { deleted: false, updatedBy: req.user.id },
            { new: true }
        );
        if (!project) return next(AppError.notFound('Proyecto archivado no encontrado'));
        res.json({ message: 'Proyecto restaurado correctamente', project });
    } catch (error) { next(error); }
};