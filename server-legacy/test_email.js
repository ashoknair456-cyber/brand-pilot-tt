import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

async function testEmail() {
    console.log('Testing email configuration...');
    console.log('User:', process.env.EMAIL_USER);

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

    try {
        await transporter.verify();
        console.log('SUCCESS: SMTP connection established.');

        const mailOptions = {
            from: `"BrandPilot Test" <${process.env.EMAIL_USER}>`,
            to: process.env.EMAIL_USER, // Send to self
            subject: 'BrandPilot SMTP Test',
            text: 'If you see this, your OTP system is working correctly!'
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('SUCCESS: Test email sent!', info.messageId);
    } catch (error) {
        console.error('FAILURE: Email test failed.');
        console.error(error);
    }
}

testEmail();
