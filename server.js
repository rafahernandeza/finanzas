const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: 5432
});

const app = express(); // Declaración única de app
app.use(cors()); // Habilita CORS para todas las rutas
app.use(express.json());

// Endpoint para guardar ingresos
app.post('/api/ingresos', async (req, res) => {
    const { concepto, monto, fecha } = req.body;
    try {
        await pool.query(
            'INSERT INTO ingresos (concepto, monto, fecha) VALUES ($1, $2, $3)',
            [concepto, monto, fecha]
        );
        res.status(201).json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Endpoint para obtener ingresos
app.get('/api/ingresos', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM ingresos');
        res.status(200).json(result.rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Endpoint para guardar egresos
app.post('/api/egresos', async (req, res) => {
    const { factura, proveedor, monto, fecha } = req.body;
    try {
        await pool.query(
            'INSERT INTO egresos (factura, proveedor, monto, fecha) VALUES ($1, $2, $3, $4)',
            [factura, proveedor, monto, fecha]
        );
        res.status(201).json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Endpoint para obtener egresos
app.get('/api/egresos', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM egresos');
        res.status(200).json(result.rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Modifica el endpoint de login para comparación directa
app.post('/api/login', async (req, res) => {
    const { correo, contrasena } = req.body;
    console.log('Datos recibidos:', { correo, contrasena }); // Para depuración
    
    try {
        const result = await pool.query('SELECT * FROM usuarios WHERE correo = $1', [correo]);
        
        if (result.rows.length > 0) {
            const user = result.rows[0];
            
            // Comparación directa (sin bcrypt)
            if (contrasena === user.contrasena) {
                res.json({ 
                    success: true, 
                    message: 'Inicio de sesión exitoso',
                    user: {
                        id: user.id,
                        nombre: user.nombre,
                        correo: user.correo
                    }
                });
            } else {
                res.status(401).json({ success: false, error: 'Contraseña incorrecta' });
            }
        } else {
            res.status(404).json({ success: false, error: 'Usuario no encontrado' });
        }
    } catch (error) {
        console.error('Error en el backend:', error);
        res.status(500).json({ success: false, error: 'Error en el servidor' });
    }
});
app.listen(3000, () => console.log('API corriendo en puerto 3000'));