# Usa una versión ligera de Node.js
FROM node:24-alpine

# Crea el directorio de trabajo
WORKDIR /app

# Copia los archivos de dependencias
COPY package*.json ./

# Instala las dependencias
RUN npm ci

# Copia el resto del código
COPY . .

# Expone el puerto de la aplicación
EXPOSE 3000

# Comando para ejecutar la app en producción
CMD ["npm", "start"]