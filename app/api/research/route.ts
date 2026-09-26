import { NextResponse } from "next/server";
import { getResearchProvider } from "@/lib/providers";
import { researchReportSchema } from "@/lib/schemas";

export async function POST(request: Request) {
  try {
    const body = await request.json() as { query?: string };
    const query = body.query?.trim();
    if (!query || query.length < 8) return NextResponse.json({ error: "Please enter a more specific research question." }, { status: 400 });
    const report = researchReportSchema.parse(await getResearchProvider().run(query));
    return NextResponse.json(report);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Research run failed." }, { status: 500 });
  }
}
