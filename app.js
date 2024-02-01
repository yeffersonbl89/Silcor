const nodemailer = require("nodemailer");
const ejs = require("ejs");
const fs = require("fs");
const path = require("path");
const exceljs = require("exceljs");
const config = require("./config/config");

// Configura el transporte del correo
const transporter = nodemailer.createTransport({
  service: "hotmail",
  auth: {
    user: config.email.user,
    pass: config.email.pass,
  },
  pool: true,
  maxConnections: 8,
  secureConnection: false,
  tls: {
    ciphers: "SSLv3",
    rejectUnauthorized: false,
  },
});

// Lee la plantilla desde el archivo
const plantilla = fs.readFileSync("./views/correo.ejs", "utf-8");

// Adjunta la imagen como un recurso embebido
const imagenPath = "./img/potugal.png"; // Ajusta la ruta y el nombre de tu imagen
const imagen = fs.readFileSync(imagenPath, { encoding: "base64" });

// Función para cargar destinatarios desde un archivo Excel
async function cargarDestinatariosDesdeExcel(archivoExcel) {
  const workbook = new exceljs.Workbook();
  await workbook.xlsx.readFile(archivoExcel);

  const worksheet = workbook.getWorksheet(1); // Suponiendo que los correos están en la primera hoja
  const destinatarios = [];

  worksheet.eachRow((row, rowNumber) => {
    const email = row.getCell(1).value;
    if (email && typeof email === "string") {
      destinatarios.push(email.trim());
      console.log(`Cargado correo: ${email.trim()}`);
    }
  });

  return destinatarios;
}

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

// Carga destinatarios desde el archivo Excel y envía correos con retardo
const archivoExcel = path.join(__dirname, "data", "Correos_Clientes.xlsx"); // Ajusta la ruta y el nombre de tu archivo Excel

async function cargarDestinatariosYEnviarCorreos() {
  try {
    const destinatarios = await cargarDestinatariosDesdeExcel(archivoExcel);

    console.log("Iniciando envío de correos...");

    for (let i = 0; i < destinatarios.length; i++) {
      await enviarCorreo(destinatarios[i]);
      console.log(`Correo enviado: ${destinatarios[i]}`);
      // Retardo de 2 segundos entre cada envío (ajusta según sea necesario)
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    console.log("Todos los correos han sido enviados.");
  } catch (error) {
    console.error(`Error al cargar destinatarios y enviar correos: ${error.message}`);
  }
}

cargarDestinatariosYEnviarCorreos();
