import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as Blob;
    
    if (!file) {
      return NextResponse.json({ error: "No audio file provided" }, { status: 400 });
    }

    const openAiFormData = new FormData();
    openAiFormData.append("file", file, "audio.webm");
    openAiFormData.append("model", "whisper-1");
    // Induce Whisper to recognize arabic alphabet phonetics
    openAiFormData.append("prompt", "alif, ba, ta, tha, jim, ha, kha, dal, dhal, ra, zay, sin, shin, sad, dad, ta, za, ayn, ghayn, fa, qaf, kaf, lam, mim, nun, ha, waw, ya, أ, ب, ت, ث, ج, ح, خ, د, ذ, ر, ز, س, ش, ص, ض, ط, ظ, ع, غ, ف, ق, ك, ل, م, ن, ه, و, ي");
    openAiFormData.append("language", "ar");

    const response = await fetch("https://api.openai.com/v1/audio/transcriptions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: openAiFormData
    });

    if (!response.ok) {
        const errorText = await response.text();
        console.error("OpenAI Whisper Error:", errorText);
        return NextResponse.json({ error: "OpenAI Whisper failed", details: errorText }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json({ text: data.text });

  } catch (error) {
    console.error("Whisper API exception:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
