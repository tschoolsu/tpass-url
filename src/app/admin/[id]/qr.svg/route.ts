// GET /admin/<id>/qr.svg：管理員限定，回可下載的 SVG。
import QRCode from "qrcode";
import { requireAdmin, ForbiddenError } from "@/lib/guard";
import { authConfig } from "@/config/auth";
import { getLink } from "@/lib/links";

export const runtime = "nodejs";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
  } catch (e) {
    if (e instanceof ForbiddenError) return new Response("Forbidden", { status: 403 });
    throw e; // redirect() 丟的要往外拋，Next 才會導向
  }
  const { id } = await params;
  const link = await getLink(id);
  if (!link) return new Response("Not found", { status: 404 });

  const svg = await QRCode.toString(`${authConfig.selfUrl}/${link.id}`, {
    type: "svg",
    margin: 1,
    width: 512,
    errorCorrectionLevel: "M",
  });
  return new Response(svg, {
    headers: {
      "content-type": "image/svg+xml; charset=utf-8",
      "content-disposition": `attachment; filename="t-url-${link.id}.svg"`,
      "cache-control": "no-store",
    },
  });
}
