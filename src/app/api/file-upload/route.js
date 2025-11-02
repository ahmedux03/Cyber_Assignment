import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

// Get user file uploads
export async function GET(request) {
  try {
    const session = await auth();
    if (!session || !session.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const url = new URL(request.url);
    const purpose = url.searchParams.get("purpose");

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
        'file_view', 
        'User viewed uploaded files',
        ${clientIP},
        ${userAgent},
        'low'
      )
    `;

    let query = `
      SELECT 
        id, file_name, file_type, file_size, file_url, upload_purpose,
        is_verified, created_at
      FROM file_uploads 
      WHERE user_id = $1
    `;
    const params = [userId];

    if (
      purpose &&
      [
        "profile_picture",
        "identity_document",
        "proof_of_address",
        "bank_statement",
        "other",
      ].includes(purpose)
    ) {
      query += ` AND upload_purpose = $${params.length + 1}`;
      params.push(purpose);
    }

    query += ` ORDER BY created_at DESC`;

    const files = await sql(query, params);

    return Response.json({ files });
  } catch (err) {
    console.error("GET /api/file-upload error", err);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// Create new file upload record
export async function POST(request) {
  try {
    const session = await auth();
    if (!session || !session.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const body = await request.json();

    const { file_name, file_type, file_size, file_url, upload_purpose } = body;

    // Input validation
    if (!file_name || typeof file_name !== "string") {
      return Response.json({ error: "Invalid file name" }, { status: 400 });
    }

    if (!file_type || typeof file_type !== "string") {
      return Response.json({ error: "Invalid file type" }, { status: 400 });
    }

    if (!file_size || typeof file_size !== "number" || file_size <= 0) {
      return Response.json({ error: "Invalid file size" }, { status: 400 });
    }

    if (file_size > 10 * 1024 * 1024) {
      // 10MB limit
      return Response.json(
        { error: "File size exceeds 10MB limit" },
        { status: 400 },
      );
    }

    if (!file_url || typeof file_url !== "string") {
      return Response.json({ error: "Invalid file URL" }, { status: 400 });
    }

    if (
      !upload_purpose ||
      ![
        "profile_picture",
        "identity_document",
        "proof_of_address",
        "bank_statement",
        "other",
      ].includes(upload_purpose)
    ) {
      return Response.json(
        { error: "Invalid upload purpose" },
        { status: 400 },
      );
    }

    // Validate file type based on purpose
    const allowedTypes = {
      profile_picture: ["image/jpeg", "image/png", "image/gif"],
      identity_document: ["image/jpeg", "image/png", "application/pdf"],
      proof_of_address: ["image/jpeg", "image/png", "application/pdf"],
      bank_statement: ["application/pdf", "image/jpeg", "image/png"],
      other: ["image/jpeg", "image/png", "application/pdf", "text/plain"],
    };

    if (!allowedTypes[upload_purpose].includes(file_type)) {
      return Response.json(
        {
          error: `File type ${file_type} not allowed for ${upload_purpose}`,
        },
        { status: 400 },
      );
    }

    // Sanitize file name to prevent path traversal
    const sanitizedFileName = file_name
      .replace(/[^a-zA-Z0-9._-]/g, "")
      .substring(0, 255);
    if (sanitizedFileName.length === 0) {
      return Response.json(
        { error: "Invalid file name format" },
        { status: 400 },
      );
    }

    // Log audit event
    const clientIP =
      request.headers.get("x-forwarded-for") ||
      request.headers.get("x-real-ip") ||
      "unknown";
    const userAgent = request.headers.get("user-agent") || "unknown";

    const riskLevel =
      upload_purpose === "identity_document"
        ? "high"
        : upload_purpose === "bank_statement"
          ? "medium"
          : "low";

    await sql`
      INSERT INTO audit_logs (
        user_id, action_type, action_description, ip_address, user_agent, 
        request_data, risk_level
      ) VALUES (
        ${userId}, 
        'file_upload', 
        ${"User uploaded " + upload_purpose + " file"},
        ${clientIP},
        ${userAgent},
        ${JSON.stringify({ file_name: sanitizedFileName, file_type, upload_purpose })},
        ${riskLevel}
      )
    `;

    // Create file upload record
    const result = await sql`
      INSERT INTO file_uploads (
        user_id, file_name, file_type, file_size, file_url, upload_purpose
      ) VALUES (
        ${userId}, ${sanitizedFileName}, ${file_type}, ${file_size}, 
        ${file_url}, ${upload_purpose}
      )
      RETURNING *
    `;

    return Response.json({ file: result[0] });
  } catch (err) {
    console.error("POST /api/file-upload error", err);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
