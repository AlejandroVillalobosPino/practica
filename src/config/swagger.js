import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'BildyApp API',
            version: '1.0.0',
            description: 'API REST para gestión de albaranes, clientes y proyectos'
        },
        servers: [{ url: 'http://localhost:3000/api' }],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT'
                }
            }
        }
    },
    apis: ['./src/routes/*.js'],
    failOnErrors: false,
};

const setupSwagger = (app) => {
    const swaggerSpec = swaggerJSDoc(options);
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
    console.log('Swagger listo en http://localhost:3000/api-docs');
};

export default setupSwagger;