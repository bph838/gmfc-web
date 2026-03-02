const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const { RawSource } = require("webpack").sources;

class JsonToIcsPlugin {
  constructor({
    input,
    output = "calendar.ics",
    prodId = "-//GMFC//Events//EN",
    nameId = "GMFC",
  }) {
    this.input = input;
    this.output = output;
    this.prodId = prodId;
    this.nameId = nameId;
    console.log("[JsonToIcsPlugin] Initialized");
  }

  apply(compiler) {
    console.log("[JsonToIcsPlugin] apply() called");

    compiler.hooks.emit.tapAsync("JsonToIcsPlugin", (compilation, callback) => {
      console.log("[JsonToIcsPlugin] emit hook fired");

      const inputPath = path.resolve(this.input);
      console.log("[JsonToIcsPlugin] Reading JSON:", inputPath);

      if (!fs.existsSync(inputPath)) {
        const msg = `[JsonToIcsPlugin] ❌ Input JSON not found: ${inputPath}`;
        console.error(msg);
        compilation.errors.push(new Error(msg));
        return callback();
      }

      let events;
      try {
        const raw = fs.readFileSync(inputPath, "utf8");
        events = JSON.parse(raw);
        console.log(`[JsonToIcsPlugin] Parsed JSON (${events.length} items)`);
      } catch (err) {
        console.error("[JsonToIcsPlugin] ❌ Failed to read or parse JSON", err);
        compilation.errors.push(err);
        return callback();
      }

      const now =
        new Date().toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";

      const lines = [
        "BEGIN:VCALENDAR",
        "VERSION:2.0",
        `PRODID:${this.prodId}`,
        "CALSCALE:GREGORIAN",
        `X-WR-CALNAME:${this.nameId}`,
        "METHOD:PUBLISH",
      ];

      events.forEach((event, index) => {
        if (!event.title || !event.start) {
          console.warn(
            `[JsonToIcsPlugin] ⚠️ Skipping event ${index} (missing title/start)`,
          );
          return;
        }

        /*console.log(
          `[JsonToIcsPlugin] → Converting event ${index}: ${event.title}`,
        );*/

        const uid = crypto
          .createHash("md5")
          .update(`${event.title}|${event.start}|${event.end || ""}`)
          .digest("hex");

        const start = event.start.replace(/-/g, "");
        let endDate = event.end ? new Date(event.end) : new Date(event.start);
        endDate.setDate(endDate.getDate() + 1);
        const end = endDate.toISOString().slice(0, 10).replace(/-/g, "");

        if (event.url) {
          if (!isAbsoluteUrl(event.url)) {
            event.url = `https://www.gmfc.uk${event.url}`;
          }
          //console.log(`   ↳ URL: ${event.url}`);

          lines.push(
            "BEGIN:VEVENT",
            `UID:${uid}@gmfc`,
            `DTSTAMP:${now}`,
            `DTSTART;VALUE=DATE:${start}`,
            `DTEND;VALUE=DATE:${end}`,
            `SUMMARY:${event.title}`,
            `DESCRIPTION:Find out more at ${event.url ? event.url : ""}`,
          );

          lines.push(`URL:${event.url}`);
        } else {
          lines.push(
            "BEGIN:VEVENT",
            `UID:${uid}@gmfc`,
            `DTSTAMP:${now}`,
            `DTSTART;VALUE=DATE:${start}`,
            `DTEND;VALUE=DATE:${end}`,
            `SUMMARY:${event.title}`,
          );
        }

        lines.push("END:VEVENT");
      });

      lines.push("END:VCALENDAR");

      const icsContent = lines.join("\r\n");

      // 1️⃣ Emit for Webpack
      compilation.emitAsset(this.output, new RawSource(icsContent));
      console.log(`[JsonToIcsPlugin] ✅ Emitted Webpack asset: ${this.output}`);

      // 2️⃣ Also write absolute file to disk
      const absolutePath = path.resolve(
        compiler.options.output.path,
        this.output,
      );
      fs.mkdirSync(path.dirname(absolutePath), { recursive: true });
      fs.writeFileSync(absolutePath, icsContent, "utf8");
      console.log(
        `[JsonToIcsPlugin] ✅ Written ICS file to disk: ${absolutePath}`,
      );

      callback();
    });
  }
}

function isAbsoluteUrl(u) {
  try {
    return Boolean(new URL(u).protocol);
  } catch {
    return false;
  }
}

module.exports = JsonToIcsPlugin;
