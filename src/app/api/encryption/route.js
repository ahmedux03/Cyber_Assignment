import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";
import crypto from "crypto";

// Simple encryption/decryption for demonstration (NOT production-ready)
const ENCRYPTION_KEY =
  process.env.ENCRYPTION_KEY || "demo-key-32-chars-1234567890ab"; // Must be 32 characters
const ALGORITHM = "aes-256-cbc";

function encrypt(text) {
  if (!text) return null;
  try {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipher(ALGORITHM, ENCRYPTION_KEY);
    let encrypted = cipher.update(text, "utf8", "hex");
    encrypted += cipher.final("hex");
    return iv.toString("hex") + ":" + encrypted;
  } catch (err) {
    console.error("Encryption error:", err);
    return null;
  }
}

function decrypt(encryptedText) {
  if (!encryptedText) return null;
  try {
    const textParts = encryptedText.split(":");
    if (textParts.length !== 2) return null;

    const iv = Buffer.from(textParts[0], "hex");
    const encryptedData = textParts[1];
    const decipher = crypto.createDecipher(ALGORITHM, ENCRYPTION_KEY);
    let decrypted = decipher.update(encryptedData, "hex", "utf8");
    decrypted += decipher.final("utf8");
    return decrypted;
  } catch (err) {
    console.error("Decryption error:", err);
    return null;
  }
}

// Encrypt data endpoint
export async function POST(request) {
  try {
    const session = await auth();
    if (!session || !session.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const body = await request.json();

    const { operation, data } = body;

    // Input validation
    if (!operation || !["encrypt", "decrypt"].includes(operation)) {
      return Response.json(
        { error: "Invalid operation. Use 'encrypt' or 'decrypt'" },
        { status: 400 },
      );
    }

    if (!data || typeof data !== "string") {
      return Response.json(
        { error: "Invalid data. Must be a string" },
        { status: 400 },
      );
    }

    if (data.length > 10000) {
      return Response.json(
        { error: "Data too large. Maximum 10,000 characters" },
        { status: 400 },
      );
    }

    // Log audit event
    const clientIP =
      request.headers.get("x-forwarded-for") ||
      request.headers.get("x-real-ip") ||
      "unknown";
    const userAgent = request.headers.get("user-agent") || "unknown";

    await sql`
      INSERT INTO audit_logs (
        user_id, action_type, action_description, ip_address, user_agent, 
        request_data, risk_level
      ) VALUES (
        ${userId}, 
        'data_encryption', 
        ${"User performed " + operation + " operation"},
        ${clientIP},
        ${userAgent},
        ${JSON.stringify({ operation, data_length: data.length })},
        'medium'
      )
    `;

    let result;
    let success = true;
    let error = null;

    if (operation === "encrypt") {
      result = encrypt(data);
      if (!result) {
        success = false;
        error = "Encryption failed";
      }
    } else if (operation === "decrypt") {
      result = decrypt(data);
      if (!result) {
        success = false;
        error = "Decryption failed - invalid format or corrupted data";
      }
    }

    if (!success) {
      return Response.json({ error }, { status: 400 });
    }

    return Response.json({
      operation,
      result,
      success: true,
      originalLength: data.length,
      resultLength: result ? result.length : 0,
    });
  } catch (err) {
    console.error("POST /api/encryption error", err);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// Get encryption info/status
export async function GET(request) {
  try {
    const session = await auth();
    if (!session || !session.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    // Log audit event
    const clientIP =
      request.headers.get("x-forwarded-for") ||
      request.headers.get("x-real-ip") ||
      "unknown";
    const userAgent = request.headers.get("user-agent") || "unknown";

    await sql`
      INSERT INTO audit_logs (
        user_id, action_type, action_description, ip_address, user_agent, 
        risk_level
      ) VALUES (
        ${userId}, 
        'encryption_info_view', 
        'User viewed encryption information',
        ${clientIP},
        ${userAgent},
        'low'
      )
    `;

    // Get count of encryption operations by this user
    const stats = await sql`
      SELECT 
        COUNT(*) as total_operations,
        COUNT(CASE WHEN action_description LIKE '%encrypt%' THEN 1 END) as encrypt_count,
        COUNT(CASE WHEN action_description LIKE '%decrypt%' THEN 1 END) as decrypt_count
      FROM audit_logs 
      WHERE user_id = ${userId} AND action_type = 'data_encryption'
    `;

    return Response.json({
      encryptionInfo: {
        algorithm: ALGORITHM,
        keyLength: 256,
        description: "AES-256-CBC encryption for data protection testing",
      },
      userStats: stats[0] || {
        total_operations: 0,
        encrypt_count: 0,
        decrypt_count: 0,
      },
      supportedOperations: ["encrypt", "decrypt"],
      maxDataLength: 10000,
    });
  } catch (err) {
    console.error("GET /api/encryption error", err);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
