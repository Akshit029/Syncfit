const express = require('express');
const router = express.Router();
const PDFDocument = require('pdfkit');
const nodemailer = require('nodemailer');
const { Readable } = require('stream');

// Configure nodemailer (example: Gmail, replace with your credentials)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER, // your email
    pass: process.env.EMAIL_PASS  // your email password or app password
  }
});

router.post('/send', async (req, res) => {
  const { email, content, type } = req.body;
  if (!email || !content) {
    return res.status(400).json({ success: false, message: 'Email and content are required.' });
  }
  try {
    // Generate PDF in memory
    const doc = new PDFDocument();
    let buffers = [];
    doc.on('data', buffers.push.bind(buffers));
    doc.on('end', async () => {
      const pdfData = Buffer.concat(buffers);
      // Send email with PDF attachment
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject: `Your ${type || 'Fitness'} Plan from SyncFit` ,
        text: 'Please find your plan attached as a PDF.',
        attachments: [
          {
            filename: `${type || 'plan'}.pdf`,
            content: pdfData
          }
        ]
      });
      res.json({ success: true });
    });
    // Write content to PDF
    doc.fontSize(18).text(`Your ${type || 'Fitness'} Plan`, { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text(content.replace(/\*/g, ''), { align: 'left' });
    doc.end();
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to send PDF email.' });
  }
});

module.exports = router; 