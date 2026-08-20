import { Router, type IRouter } from "express";
import { Resend } from "resend";

const router: IRouter = Router();

const RECIPIENT = "yuli-142@hotmail.com";

router.post("/rating", async (req, res) => {
  const { rating, stars, total } = req.body as {
    rating: "happy" | "sad";
    stars: number;
    total: number;
  };

  const resend = new Resend(process.env.RESEND_API_KEY);

  const emoji = rating === "happy" ? "😊" : "😢";
  const sentimiento = rating === "happy" ? "¡Le gustó!" : "No mucho";
  const fecha = new Date().toLocaleString("es-MX", {
    timeZone: "America/Mexico_City",
    dateStyle: "full",
    timeStyle: "short",
  });

  try {
    const { data, error } = await resend.emails.send({
      from: "GeoMundo <onboarding@resend.dev>",
      to: [RECIPIENT],
      subject: `${emoji} Nueva calificación en GeoMundo — ${sentimiento}`,
      html: `
        <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px;border-radius:16px;border:1px solid #e5e7eb;">
          <h2 style="color:#166534;margin-bottom:4px;">GeoMundo Interactivo</h2>
          <p style="color:#6b7280;margin-top:0;">Nueva calificación recibida</p>
          <hr style="border:none;border-top:1px solid #e5e7eb;margin:16px 0;">
          <table style="width:100%;border-collapse:collapse;">
            <tr>
              <td style="padding:8px 0;color:#374151;font-weight:600;">¿Le gustó aprender?</td>
              <td style="padding:8px 0;font-size:28px;">${emoji}</td>
              <td style="padding:8px 0;color:${rating === "happy" ? "#16a34a" : "#dc2626"};font-weight:600;">${sentimiento}</td>
            </tr>
            <tr>
              <td style="padding:8px 0;color:#374151;font-weight:600;">Estrellas obtenidas</td>
              <td colspan="2" style="padding:8px 0;color:#374151;">${"⭐".repeat(stars)} (${stars} de ${total})</td>
            </tr>
            <tr>
              <td style="padding:8px 0;color:#374151;font-weight:600;">Fecha y hora</td>
              <td colspan="2" style="padding:8px 0;color:#374151;">${fecha}</td>
            </tr>
          </table>
        </div>
      `,
    });

    if (error) {
      req.log.error({ error }, "resend returned error");
      res.status(500).json({ ok: false, error });
      return;
    }

    req.log.info({ rating, stars, emailId: data?.id }, "rating email sent");
    res.json({ ok: true });
  } catch (err) {
    req.log.error({ err }, "failed to send rating email");
    res.status(500).json({ ok: false });
  }
});

export default router;
