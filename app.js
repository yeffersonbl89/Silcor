const nodemailer = require("nodemailer");
const ejs = require("ejs");
const fs = require("fs");
const config = require("./config/config")

// Configura el transporte del correo
const transporter = nodemailer.createTransport({
  service: "hotmail",
  auth: {
    user: config.email.user,
    pass: config.email.pass,
  },
  pool: true,
  maxConnections: 5,
  secureConnection: false,
  tls: {
    ciphers: "SSLv3",
    rejectUnauthorized: false,
  },
});

// Lista de destinatarios (puedes cargarla desde una base de datos u otro origen)
const destinatarios = [
  "laddy1586@hotmail.com",
  "laddy1509@gmail.com",
  "yeffertattoo05@gmail.com",
  "ybocanegra07@soy.sena.edu.co",
  "lady@silcor.info",
];

// Lee la plantilla desde el archivo
const plantilla = fs.readFileSync("./views/correo.ejs", "utf-8");

// Adjunta la imagen como un recurso embebido
const imagenPath = "./img/potugal.png"; // Ajusta la ruta y el nombre de tu imagen
const imagen = fs.readFileSync(imagenPath, { encoding: "base64" });

// Envía el correo a cada destinatario
async function enviarCorreo(destinatario) {
    try {
      const contenidoCorreo = ejs.render(plantilla, {});
  
      const mensaje = {
        from: "yeffer-89@hotmail.com",
        to: destinatario,
        subject: "Respuesta Trámites Ciudadanía Portuguesa",
        html: contenidoCorreo,
        attachments: [
          {
            filename: "portugal.png",
            content: imagen,
            encoding: "base64",
            cid: "imagen",
          },
        ],
      };
  
      const info = await transporter.sendMail(mensaje);
      console.log(`Correo enviado a ${destinatario}: ${info.response}`);
    } catch (error) {
      console.error(`Error al enviar correo a ${destinatario}: ${error.message}`);
    }
  }
  
  // Envía el correo a cada destinatario con un retardo
  destinatarios.forEach((destinatario, index) => {
    setTimeout(() => {
      enviarCorreo(destinatario);
    }, index * 2000);
  });
