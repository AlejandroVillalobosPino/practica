import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'BildyApp API',
            version: '1.0.0',
        },
        servers: [{ url: 'http://localhost:3000/api' }],
    },
    apis: ['./src/routes/*.js'],
    // ESTO EVITARÁ QUE EL SERVIDOR DEJE DE MOSTRAR COSAS POR ERRORES DE YAML
    failOnErrors: false,
};

const setupSwagger = (app) => {
    const swaggerSpec = swaggerJSDoc(options);
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
    console.log('🚀 Swagger listo en http://localhost:3000/api-docs');
};

export default setupSwagger;