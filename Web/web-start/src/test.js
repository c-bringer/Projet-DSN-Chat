const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'hotmail',
    auth: {
        user: 'dsn.chatnode12345@outlook.fr',
        pass: 'Ceciestmonmotdepasse123'
    }
});

const mailOptions = {
    from: 'dsn.chatnode12345@outlook.fr',
    to: 'gaetan.charronbalat@limayrac.fr',
    subject: 'Sending Email using Node.js',
    text: 'That was easy!'
};

function sendEmail(email, code) {
    const mailOptions = {
        from: 'dsn.chatnode12345@outlook.fr',
        to: email,
        subject: 'Test envoie des chiffres',
        text: code
    };

    transporter.sendMail(mailOptions, function(error, info){
        if (error) {
            console.log(error);
        } else {
            console.log('Email sent: ' + info.response);
        }
    });
}