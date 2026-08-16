import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";

function formatDateStr(val) {
  if (!val) return "—";
  const d = val instanceof Date ? val : new Date(val);
  return isNaN(d.getTime())
    ? "—"
    : d.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}

export async function downloadCertificatePDF(certificate, elementId = "printable-certificate") {
  if (!certificate) return;

  let targetElement = document.getElementById(elementId);
  let isTemp = false;

  // If the certificate preview DOM element is not currently mounted, create a temporary container off-screen
  if (!targetElement) {
    isTemp = true;
    targetElement = document.createElement("div");
    targetElement.id = "temp-printable-certificate";
    targetElement.style.position = "fixed";
    targetElement.style.left = "-9999px";
    targetElement.style.top = "-9999px";
    targetElement.style.width = "960px";
    targetElement.style.background = "#faf7f2";

    const PRODUCTION_BASE_URL = "https://sportsphere-81746.web.app";
    const verifyUrl = `${PRODUCTION_BASE_URL}/certificates/${encodeURIComponent(certificate.certificateId)}`;
    const qrCodeImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(verifyUrl)}&color=6b091f`;

    const tournamentDateFormatted = formatDateStr(certificate.tournamentDate || certificate.issueDate);
    const issueDateFormatted = formatDateStr(certificate.issueDate || certificate.issuedAt);

    targetElement.innerHTML = `
      <div style="padding: 40px; background: linear-gradient(135deg, #fdfcf9 0%, #faf6f0 50%, #f7f1e7 100%); position: relative; width: 960px; box-sizing: border-box; font-family: 'Outfit', sans-serif; color: #1e293b; border-radius: 8px; box-shadow: 0 15px 40px rgba(88, 12, 30, 0.15); overflow: hidden;">
        <!-- Deep Maroon & Gold Double Border Frame -->
        <div style="position: absolute; top: 12px; left: 12px; right: 12px; bottom: 12px; border: 4px solid #6b091f; pointer-events: none;"></div>
        <div style="position: absolute; top: 18px; left: 18px; right: 18px; bottom: 18px; border: 2px solid #d4af37; pointer-events: none;"></div>
        <div style="position: absolute; top: 22px; left: 22px; right: 22px; bottom: 22px; border: 1px dashed rgba(107, 9, 31, 0.25); pointer-events: none;"></div>

        <!-- Refined Corner Ornaments -->
        <div style="position: absolute; top: 12px; left: 12px; width: 24px; height: 24px; background: #6b091f; border: 2px solid #d4af37; display: flex; align-items: center; justify-content: center; z-index: 2;"><div style="width: 8px; height: 8px; background: #d4af37; transform: rotate(45deg);"></div></div>
        <div style="position: absolute; top: 12px; right: 12px; width: 24px; height: 24px; background: #6b091f; border: 2px solid #d4af37; display: flex; align-items: center; justify-content: center; z-index: 2;"><div style="width: 8px; height: 8px; background: #d4af37; transform: rotate(45deg);"></div></div>
        <div style="position: absolute; bottom: 12px; left: 12px; width: 24px; height: 24px; background: #6b091f; border: 2px solid #d4af37; display: flex; align-items: center; justify-content: center; z-index: 2;"><div style="width: 8px; height: 8px; background: #d4af37; transform: rotate(45deg);"></div></div>
        <div style="position: absolute; bottom: 12px; right: 12px; width: 24px; height: 24px; background: #6b091f; border: 2px solid #d4af37; display: flex; align-items: center; justify-content: center; z-index: 2;"><div style="width: 8px; height: 8px; background: #d4af37; transform: rotate(45deg);"></div></div>

        <!-- Content Area -->
        <div style="position: relative; z-index: 1; padding: 0 24px;">
          <!-- Header -->
          <div style="text-align: center; margin-bottom: 16px;">
            <div style="display: inline-flex; align-items: center; gap: 8px; margin-bottom: 4px;">
              <span style="color: #d4af37; font-size: 24px;">🏆</span>
              <span style="letter-spacing: 4px; text-transform: uppercase; color: #6b091f; font-weight: 900; font-family: 'Cinzel', serif; font-size: 1.1rem;">SPORT SPHERE</span>
              <span style="color: #d4af37; font-size: 24px;">🏆</span>
            </div>
            <div style="letter-spacing: 2px; text-transform: uppercase; color: #78350f; font-weight: 700; font-size: 0.72rem;">Official Sports Tournament Management Organization</div>
          </div>

          <!-- Main Title -->
          <div style="text-align: center; margin-bottom: 20px;">
            <h1 style="font-family: 'Cinzel', serif; font-weight: 900; color: #6b091f; letter-spacing: 1px; text-transform: uppercase; font-size: 2.5rem; margin: 0;">Certificate of Achievement</h1>
            <div style="width: 140px; height: 2px; background: linear-gradient(90deg, transparent, #d4af37, #6b091f, #d4af37, transparent); margin: 8px auto 12px auto;"></div>
            <div style="letter-spacing: 3px; text-transform: uppercase; color: #475569; font-weight: 700; font-size: 0.82rem;">PROUDLY PRESENTED TO</div>
          </div>

          <!-- Participant Name -->
          <div style="text-align: center; margin: 16px 0;">
            <div style="font-family: 'Playfair Display', serif; font-weight: 800; font-style: italic; color: #6b091f; font-size: 2.8rem; display: inline-block;">${certificate.participantName || "Participant"}</div>
            <div style="width: 60%; max-width: 420px; height: 2px; background: #d4af37; margin: 4px auto 0 auto;"></div>
          </div>

          <!-- Achievement Text -->
          <div style="text-align: center; max-width: 720px; margin: 20px auto;">
            <div style="color: #334155; font-size: 1.05rem; line-height: 1.6;">
              For outstanding athletic performance and securing <span style="font-weight: 800; color: #6b091f; background: rgba(212, 175, 55, 0.15); padding: 2px 10px; border-radius: 4px; border: 1px solid rgba(212, 175, 55, 0.4); display: inline-block; margin: 0 4px;">🏆 ${certificate.achievement || "Participant"}</span> in the official tournament event
            </div>
            <div style="color: #0f172a; margin-top: 12px; font-family: 'Cinzel', serif; font-weight: 800; font-size: 1.3rem;">${certificate.tournamentName || "SportSphere Championship"}</div>
            <div style="color: #6b091f; margin-top: 6px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; font-size: 0.85rem;">Sport Category: ${certificate.sportName || certificate.sport || "General Sport"}</div>
          </div>

          <!-- Bottom Row: Left QR/Dates, Center Seal, Right Signatures -->
          <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-top: 24px; padding-top: 16px; border-top: 1px solid rgba(212, 175, 55, 0.4);">
            <!-- Left Column -->
            <div style="display: flex; align-items: flex-end; gap: 20px;">
              <div style="text-align: center;">
                <img src="${qrCodeImageUrl}" crossOrigin="anonymous" alt="QR" style="width: 76px; height: 76px; border: 2px solid #d4af37; border-radius: 6px; background: #ffffff; padding: 4px;" />
                <div style="margin-top: 4px; font-weight: 800; font-size: 0.65rem; letter-spacing: 1px; color: #6b091f;">SCAN TO VERIFY</div>
              </div>
              <div style="min-width: 150px;">
                <div style="color: #64748b; font-weight: 800; font-size: 0.68rem;">TOURNAMENT DATE</div>
                <div style="font-weight: 700; color: #0f172a; margin-bottom: 8px; font-size: 0.9rem;">${tournamentDateFormatted}</div>
                <div style="color: #64748b; font-weight: 800; font-size: 0.68rem;">ISSUE DATE</div>
                <div style="font-weight: 700; color: #0f172a; font-size: 0.9rem;">${issueDateFormatted}</div>
              </div>
            </div>

            <!-- Center Column -->
            <div style="text-align: center;">
              <div style="position: relative; width: 90px; height: 90px; border-radius: 50%; background: radial-gradient(circle, #fef08a 0%, #d4af37 60%, #b8860b 100%); border: 3px solid #6b091f; color: #6b091f; display: flex; flex-direction: column; align-items: center; justify-content: center; margin: 0 auto; box-shadow: 0 4px 15px rgba(184, 134, 11, 0.4);">
                <div style="font-size: 0.55rem; font-weight: 900; letter-spacing: 1px; font-family: 'Cinzel', serif;">SPORTSPHERE</div>
                <div style="font-size: 24px; margin: 2px 0;">🏆</div>
                <div style="font-size: 0.52rem; font-weight: 800; letter-spacing: 0.5px; font-family: 'Cinzel', serif;">SINCE 2007</div>
              </div>
            </div>

            <!-- Right Column -->
            <div style="display: flex; align-items: flex-end; gap: 28px; text-align: center; transform: translateX(42px);">
              <div>
                <div style="font-family: 'Great Vibes', cursive; font-size: 1.6rem; color: #6b091f; line-height: 1; transform: rotate(-3deg);">Kadali Chaitanya</div>
                <div style="border-top: 1.5px solid #6b091f; padding-top: 4px; width: 135px; margin-top: 4px;">
                  <div style="font-weight: 900; color: #0f172a; letter-spacing: 0.5px; font-size: 0.78rem;">KADALI CHAITANYA</div>
                  <div style="color: #64748b; font-weight: 800; letter-spacing: 0.8px; font-size: 0.65rem;">AUTHORIZED SIGNATORY</div>
                </div>
              </div>
              <div>
                <div style="font-family: 'Great Vibes', cursive; font-size: 1.6rem; color: #6b091f; line-height: 1; transform: rotate(-2deg);">Magnus Carlsen</div>
                <div style="border-top: 1.5px solid #6b091f; padding-top: 4px; width: 125px; margin-top: 4px;">
                  <div style="font-weight: 900; color: #0f172a; letter-spacing: 0.5px; font-size: 0.78rem;">MAGNUS CARLSEN</div>
                  <div style="color: #64748b; font-weight: 800; letter-spacing: 0.8px; font-size: 0.65rem;">SUB ORGANIZER</div>
                </div>
              </div>
            </div>
          </div>

          <!-- Footer Info -->
          <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 16px; padding-top: 8px; border-top: 1px solid rgba(107, 9, 31, 0.1); font-size: 0.7rem; color: #64748b;">
            <div style="font-weight: 800; font-family: monospace; color: #6b091f;">UNIQUE CERTIFICATE ID: ${certificate.certificateId}</div>
            <div style="font-style: italic; font-size: 0.68rem;">This official certificate is digitally encrypted & authenticated by SportSphere Management System.</div>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(targetElement);

    const imgs = targetElement.querySelectorAll("img");
    await Promise.all(
      Array.from(imgs).map(
        (img) =>
          new Promise((res) => {
            if (img.complete) res();
            else {
              img.onload = res;
              img.onerror = res;
            }
          })
      )
    );
  }

  try {
    // Render the DOM preview element to a canvas with scale: 3 for crisp high-DPI quality
    const canvas = await html2canvas(targetElement, {
      scale: 3,
      useCORS: true,
      allowTaint: true,
      logging: false,
      backgroundColor: "#faf7f2",
    });

    const imgData = canvas.toDataURL("image/png");

    const pdf = new jsPDF({
      orientation: "landscape",
      unit: "mm",
      format: "a4",
    });

    // Standard A4 landscape dimensions: 297mm x 210mm
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();

    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);

    const filename = `SportSphere_Certificate_${certificate.certificateId}.pdf`;
    pdf.save(filename);
  } catch (err) {
    console.error("Failed to generate PDF from preview element:", err);
  } finally {
    if (isTemp && targetElement && targetElement.parentNode) {
      targetElement.parentNode.removeChild(targetElement);
    }
  }
}
