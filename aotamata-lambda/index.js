// index.js
const AWS = require('aws-sdk');
const ses = new AWS.SES({ region: 'ap-southeast-1' }); // Ganti dengan region AWS Anda

exports.handler = async (event) => {
    console.log('Received event:', JSON.stringify(event, null, 2));

    let formData;
    try {
        if (event.headers && event.headers['content-type'] && event.headers['content-type'].includes('application/json')) {
            formData = JSON.parse(event.body);
        } else if (event.headers && event.headers['content-type'] && event.headers['content-type'].includes('application/x-www-form-urlencoded')) {
            formData = new URLSearchParams(event.body);
            let obj = {};
            for (let pair of formData.entries()) {
                obj[pair[0]] = pair[1];
            }
            formData = obj;
        } else {
            formData = event.body;
        }
    } catch (error) {
        console.error('Error parsing request body:', error);
        return {
            statusCode: 400,
            headers: { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Methods": "POST,OPTIONS", "Access-Control-Allow-Headers": "Content-Type" },
            body: JSON.stringify({ message: 'Invalid request body format.', error: error.message })
        };
    }

    console.log('Form data received:', formData);

    // Validasi dasar
    if (!formData.name || !formData.email || !formData.message) {
        console.warn('Missing required fields:', formData);
        return {
            statusCode: 400,
            headers: { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Methods": "POST,OPTIONS", "Access-Control-Allow-Headers": "Content-Type" },
            body: JSON.stringify({ message: 'Nama, email, dan pesan wajib diisi.' }),
        };
    }

    // --- Bagian Baru: Mengirim Email menggunakan SES ---
    const senderEmail = 'info@aotamata.space'; // Ganti dengan alamat email yang sudah Anda verifikasi di SES
    const recipientEmail = 'riefkyiqbalm@gmail.com'; // Ganti dengan alamat email pribadi Anda (juga harus diverifikasi jika di sandbox)

    const emailBody = `
        Nama: ${formData.name}
        Email: ${formData.email}
        Pesan:
        ${formData.message}
    `;

    const params = {
        Destination: {
            ToAddresses: [recipientEmail]
        },
        Message: {
            Body: {
                Text: { Data: emailBody }
            },
            Subject: { Data: `Pesan Baru dari Formulir Web: ${formData.name}` }
        },
        Source: senderEmail
    };

    try {
        await ses.sendEmail(params).promise();
        console.log('Email sent successfully!');
    } catch (sesError) {
        console.error('Error sending email:', sesError);
        return {
            statusCode: 500,
            headers: { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Methods": "POST,OPTIONS", "Access-Control-Allow-Headers": "Content-Type" },
            body: JSON.stringify({ message: 'Failed to send email.', error: sesError.message })
        };
    }
    // --- Akhir Bagian Baru ---

    const response = {
        statusCode: 200,
        headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "POST,OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type"
        },
        body: JSON.stringify({ message: 'Formulir berhasil dikirim dan email telah dikirim!' }),
    };
    return response;
};