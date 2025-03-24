import nodemailer from "nodemailer";

const mailSender = async (email: string, title: string, body: string) => {
  try {
    let transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST,
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });

    let info = await transporter.sendMail({
      from: "Nomzyne - Store Managment System",
      to: `${email}`,
      subject: `${title}`,
      html: `${body}`,
    });
    return info;
  } catch (e) {
    if (e instanceof Error) {
      console.log(e);
    }
  }
};

export default mailSender;
