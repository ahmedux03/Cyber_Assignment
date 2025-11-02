import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

// Get audit logs for the authenticated user
export async function GET(request) {
  try {
    const session = await auth();
    if (!session || !session.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get("limit")) || 50;
    const offset = parseInt(url.searchParams.get("offset")) || 0;
    const riskLevel = url.searchParams.get("risk_level");
    const actionType = url.searchParams.get("action_type");

    // Input validation
    if (limit > 200) {
      return Response.json(
        { error: "Limit cannot exceed 200" },
        { status: 400 },
      );
    }

    // Log that someone accessed audit logs
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
        'audit_logs_view', 
        'User accessed audit log history',
        ${clientIP},
        ${userAgent},
        'medium'
      )
    `;

    let query = `
      SELECT 
        id, action_type, action_description, ip_address, user_agent,
        session_id, request_data, response_data, risk_level, created_at
      FROM audit_logs 
      WHERE user_id = $1
    `;
    const params = [userId];

    if (
      riskLevel &&
      ["low", "medium", "high", "critical"].includes(riskLevel)
    ) {
      query += ` AND risk_level = $${params.length + 1}`;
      params.push(riskLevel);
    }

    if (actionType && typeof actionType === "string") {
      query += ` AND action_type = $${params.length + 1}`;
      params.push(actionType);
    }

    query += ` ORDER BY created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);

    const auditLogs = await sql(query, params);

    return Response.json({
      auditLogs,
      pagination: {
        limit,
        offset,
        hasMore: auditLogs.length === limit,
      },
    });
  } catch (err) {
    console.error("GET /api/audit-logs error", err);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// Create audit log entry (mainly for testing security events)
export async function POST(request) {
  try {
    const session = await auth();
    if (!session || !session.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const body = await request.json();

    const {
      action_type,
      action_description,
      risk_level = "low",
      request_data = null,
    } = body;

    // Input validation
    if (!action_type || typeof action_type !== "string") {
      return Response.json({ error: "Invalid action type" }, { status: 400 });
    }

    if (!action_description || typeof action_description !== "string") {
      return Response.json(
        { error: "Invalid action description" },
        { status: 400 },
      );
    }

    if (!["low", "medium", "high", "critical"].includes(risk_level)) {
      return Response.json({ error: "Invalid risk level" }, { status: 400 });
    }

    // Sanitize action_type to prevent injection
    const sanitizedActionType = action_type.replace(/[^a-zA-Z0-9_-]/g, "");
    if (sanitizedActionType.length === 0) {
      return Response.json(
        { error: "Invalid action type format" },
        { status: 400 },
      );
    }

    const clientIP =
      request.headers.get("x-forwarded-for") ||
      request.headers.get("x-real-ip") ||
      "unknown";
    const userAgent = request.headers.get("user-agent") || "unknown";

    // Create audit log entry
    const result = await sql`
      INSERT INTO audit_logs (
        user_id, action_type, action_description, ip_address, user_agent, 
        request_data, risk_level
      ) VALUES (
        ${userId}, ${sanitizedActionType}, ${action_description}, 
        ${clientIP}, ${userAgent}, ${JSON.stringify(request_data)}, ${risk_level}
      )
      RETURNING *
    `;

    return Response.json({ auditLog: result[0] });
  } catch (err) {
    console.error("POST /api/audit-logs error", err);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
