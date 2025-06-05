import mysql from 'mysql2/promise'

export const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',        // Changed from 'admin' to 'root'
    password: '',        // Usually root has empty password in local development
    database: 'streaming'
})