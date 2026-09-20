import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.resolve(__dirname, 'brandpilot.db');

const emailToDelete = 'mohan123monti@gmail.com';

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database:', err);
        return;
    }

    // Delete the specific user
    db.run('DELETE FROM users WHERE email = ?', [emailToDelete], function (err) {
        if (err) {
            console.error('Error deleting user:', err);
        } else {
            console.log(`Successfully deleted user with email: ${emailToDelete}`);
            console.log(`Rows affected: ${this.changes}`);
        }

        // Also clear brand/campaigns if it's a "reset" request
        // But usually, user just wants to re-register.

        db.close();
    });
});
