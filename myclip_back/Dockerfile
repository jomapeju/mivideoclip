# Utiliza una imagen base de Node.js
   FROM node:16

   # Crea y establece el directorio de trabajo
   WORKDIR /usr/src/app

   # Copia los archivos del proyecto
   COPY package*.json ./

   # Instala las dependencias del proyecto
   RUN npm install

   # Copia el resto de los archivos del proyecto
   COPY . .

   # Expone el puerto que va a usar el contenedor
   EXPOSE 3000

   # Define el comando para iniciar la aplicación
   CMD ["npm", "run", "start"]