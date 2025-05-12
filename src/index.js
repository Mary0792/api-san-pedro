import app from "./app.js";

// Utiliza la variable de entorno para el puerto o 3000 por defecto
const port = process.env.PORT || 3000;

// Inicia el servidor y escucha en el puerto especificado
app.listen(port, () => {
    // Muestra un mensaje en la consola indicando que la API ha iniciado correctamente
    console.log(`API iniciada en el puerto ${port}`);
});