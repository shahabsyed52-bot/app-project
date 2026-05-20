import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI || "";

if (!MONGODB_URI) {
  console.warn("MONGODB_URI not set — using file fallback");
}

// Cache connection across hot reloads in dev
declare global {
  // eslint-disable-next-line no-var
  var _mongoConn: typeof mongoose | null;
}

let cached = global._mongoConn || null;

export async function connectDB() {
  if (!MONGODB_URI) return null;
  if (cached) return cached;
  try {
    cached = await mongoose.connect(MONGODB_URI, { bufferCommands: false });
    global._mongoConn = cached;
    return cached;
  } catch (e) {
    console.error("MongoDB connection failed:", e);
    return null;
  }
}

// ── Schemas ──────────────────────────────────────────
const VideoSchema = new mongoose.Schema({
  title:      String,
  youtubeId:  String,
  category:   String,
  artist:     String,
  year:       Number,
  description:String,
}, { timestamps: true });

const LyricSchema = new mongoose.Schema({
  title:    String,
  artist:   String,
  category: String,
  script:   { type: String, default: "roman" }, // "roman" | "urdu"
  lyrics:   String,
}, { timestamps: true });

const SettingSchema = new mongoose.Schema({
  key:   { type: String, unique: true },
  value: mongoose.Schema.Types.Mixed,
});

export const VideoModel   = mongoose.models.Video   || mongoose.model("Video",   VideoSchema);
export const LyricModel   = mongoose.models.Lyric   || mongoose.model("Lyric",   LyricSchema);
export const SettingModel = mongoose.models.Setting || mongoose.model("Setting", SettingSchema);

// ── Helper: get/set setting by key ──────────────────
export async function getSetting(key: string, defaultVal: unknown = null) {
  await connectDB();
  const doc = await SettingModel.findOne({ key }).lean() as {value?: unknown} | null;
  return doc?.value ?? defaultVal;
}
export async function setSetting(key: string, value: unknown) {
  await connectDB();
  await SettingModel.findOneAndUpdate({ key }, { value }, { upsert: true });
}
