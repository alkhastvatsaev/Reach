import { NextResponse } from 'next/server';
import { Resend } from 'resend';

// === PROFIL CANDIDAT (BTS SIO) ===
const CANDIDATE = {
  firstName: 'Alkhast',
  lastName: 'VATSAEV',
  fullName: 'Alkhast VATSAEV',
  phone: '07 67 69 38 04',
  email: 'alkhastvatsaev@icloud.com',
  address: '3 Rue Fred Vlès – 67000 Strasbourg',
  diploma: 'BTS SIO (Services Informatiques aux Organisations)',
  option: 'SLAM (Solutions Logicielles et Applications Métiers)',
  skills: [
    'JavaScript / TypeScript',
    'React.js / Next.js',
    'Node.js',
    'Python',
    'Firebase / Firestore',
    'SQL / PostgreSQL',
    'Git / GitHub',
    'API REST',
    'HTML5 / CSS3',
    'Déploiement Vercel'
  ],
  experience: 'Développeur fullstack avec 3 projets d\'envergure déployés. Ancien expert en conception 3D (Cartier), j\'allie rigueur industrielle et expertise web moderne.',
};

const resend = new Resend(process.env.RESEND_API_KEY);

function generateEmailHtml(
  prospectName: string,
  companyName: string,
  pitch: string,
  lm?: string
): string {
  // Logic for a natural greeting
  let greeting = `Bonjour ${prospectName},`;
  
  // If the name is generic or contains "Responsable" / "RH", fallback to formal
  const nameIsGeneric = !prospectName || 
                        prospectName.toLowerCase().includes('responsable') || 
                        prospectName.toLowerCase().includes('rh') ||
                        prospectName.toLowerCase().includes('directeur');

  if (nameIsGeneric) {
    greeting = "Madame, Monsieur,";
  }

  const skillsList = CANDIDATE.skills.slice(0, 6).join(' · ');

  return `
    <div style="font-family: -apple-system, sans-serif; line-height: 1.6; color: #1d1d1f; max-width: 650px; margin: 0 auto; padding: 20px;">
      <p style="font-size: 16px;">${greeting}</p>

      <p style="font-size: 15px;">
        Je me permets de vous contacter pour vous proposer ma candidature pour une <strong>alternance en développement informatique</strong> au sein de <strong>${companyName}</strong>.
      </p>

      <div style="border-left: 3px solid #6366f1; padding-left: 15px; margin: 20px 0; color: #333; font-style: italic;">
        "${pitch}"
      </div>

      ${lm ? `
      <div style="background: #ffffff; border: 1px solid #e5e5e7; padding: 25px; border-radius: 12px; margin-bottom: 25px; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
        <h3 style="font-size: 14px; text-transform: uppercase; letter-spacing: 1px; color: #6366f1; margin: 0 0 15px 0;">Lettre de Motivation</h3>
        <div style="font-size: 14.5px; white-space: pre-line; color: #1d1d1f;">
          ${lm}
        </div>
      </div>
      ` : ''}

      <div style="background: #f5f5f7; padding: 15px; border-radius: 8px; margin-bottom: 25px;">
        <p style="font-size: 13px; font-weight: 600; margin: 0 0 5px 0;">Stack technique :</p>
        <p style="font-size: 13px; color: #515154; margin: 0;">${skillsList}</p>
      </div>

      <p style="font-size: 15px;">
        Vous trouverez ci-joint mon CV détaillant mes projets et mon parcours. Je suis prêt à vous présenter ma motivation lors d'un entretien, en présentiel à Strasbourg ou en visio.
      </p>

      <p style="font-size: 15px;">Bien cordialement,</p>
      
      <div style="margin-top: 20px; border-top: 1px solid #e5e5e7; padding-top: 15px;">
        <p style="font-size: 15px; font-weight: 700; margin: 0;">${CANDIDATE.fullName}</p>
        <p style="font-size: 12px; color: #86868b; margin: 2px 0;">07 67 69 38 04 · ${CANDIDATE.email}</p>
        <p style="font-size: 12px; color: #86868b; margin: 0;">3 Rue Fred Vlès – 67000 Strasbourg</p>
      </div>
    </div>
  `;
}

export async function POST(req: Request) {
  try {
    const { toEmail, prospectName, companyName, icebreaker, lm, cc, subject } = await req.json();
    if (!toEmail) return NextResponse.json({ success: false, error: 'Email manquant.' }, { status: 400 });

    if (!process.env.RESEND_API_KEY) {
      return NextResponse.json({ success: false, error: "Resend non configuré." }, { status: 500 });
    }

    const emailHtml = generateEmailHtml(prospectName, companyName, icebreaker, lm);
    const mailSubject = subject || `Candidature Alternance Développeur | ${CANDIDATE.fullName}`;

    const { data, error } = await resend.emails.send({
      from: 'Alkhast VATSAEV <onboarding@resend.dev>', // Default for testing, change to your domain later
      to: [toEmail],
      cc: cc || [],
      subject: mailSubject,
      html: emailHtml,
    });

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, id: data?.id });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
