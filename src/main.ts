import * as fs from "https://deno.land/std@0.125.0/fs/mod.ts";
import * as path from "https://deno.land/std@0.125.0/path/mod.ts";
import * as server from "https://deno.land/std@0.125.0/http/server.ts";
import { crypto } from "https://deno.land/std@0.125.0/crypto/mod.ts";

const DIRECTORY = "reports";
const PORT = parseInt(String(Deno.env.get("PORT")), 10) || 8080;

function timestamp(): string {
  const random = new Uint16Array(1);

  crypto.getRandomValues(random);

  return String(Date.now()) + String(random[0]).padStart(5, "0");
}

async function handler(req: Request, info: server.ConnInfo): Promise<Response> {
  const ip = req.headers.get("x-forwarded-for") ||
    (info.remoteAddr as Deno.NetAddr).hostname;
  console.log(`reportcard: ${ip} ${req.method} ${req.url}`);

  if (req.method === "POST" && req.body) {
    try {
      const headers = Object.fromEntries(req.headers.entries());
      const report = { ip: ip, headers: headers, body: await req.json() };
      const contents = JSON.stringify(report);
      const filename = path.join(DIRECTORY, timestamp() + ".json");

      fs.ensureDirSync(DIRECTORY);
      Deno.writeTextFileSync(filename, contents);
    } catch (err) {
      console.error(
        `reportcard: Failed to write report to file: ${String(err)}`,
      );
    }
  }

  return new Response(null, { status: 200 });
}

console.log(`reportcard: Listening on port ${PORT}...`);
await server.serve(handler, { port: PORT });
