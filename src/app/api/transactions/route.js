import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

// Get user transactions
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
    const type = url.searchParams.get("type");

    // Input validation
    if (limit > 100) {
      return Response.json(
        { error: "Limit cannot exceed 100" },
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
        risk_level
      ) VALUES (
        ${userId}, 
        'transaction_view', 
        'User viewed transaction history',
        ${clientIP},
        ${userAgent},
        'low'
      )
    `;

    let query = `
      SELECT 
        id, transaction_type, amount, description, recipient_account,
        transaction_status, reference_number, created_at, processed_at
      FROM transactions 
      WHERE user_id = $1
    `;
    const params = [userId];

    if (
      type &&
      ["deposit", "withdrawal", "transfer", "payment"].includes(type)
    ) {
      query += ` AND transaction_type = $${params.length + 1}`;
      params.push(type);
    }

    query += ` ORDER BY created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);

    const transactions = await sql(query, params);

    return Response.json({ transactions });
  } catch (err) {
    console.error("GET /api/transactions error", err);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// Create new transaction
export async function POST(request) {
  try {
    const session = await auth();
    if (!session || !session.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const body = await request.json();

    const { transaction_type, amount, description, recipient_account } = body;

    // Input validation
    if (
      !transaction_type ||
      !["deposit", "withdrawal", "transfer", "payment"].includes(
        transaction_type,
      )
    ) {
      return Response.json(
        { error: "Invalid transaction type" },
        { status: 400 },
      );
    }

    if (!amount || typeof amount !== "number" || amount <= 0) {
      return Response.json({ error: "Invalid amount" }, { status: 400 });
    }

    if (amount > 50000) {
      return Response.json(
        { error: "Transaction amount exceeds daily limit" },
        { status: 400 },
      );
    }

    if (description && typeof description !== "string") {
      return Response.json({ error: "Invalid description" }, { status: 400 });
    }

    if (recipient_account && typeof recipient_account !== "string") {
      return Response.json(
        { error: "Invalid recipient account" },
        { status: 400 },
      );
    }

    // Validate recipient account format for transfers/payments
    if (
      (transaction_type === "transfer" || transaction_type === "payment") &&
      recipient_account
    ) {
      if (!/^[A-Z0-9]{10,20}$/.test(recipient_account)) {
        return Response.json(
          { error: "Invalid recipient account format" },
          { status: 400 },
        );
      }
    }

    // Generate reference number
    const reference_number = `TXN${Date.now()}${Math.random().toString(36).substr(2, 6).toUpperCase()}`;

    // Log audit event
    const clientIP =
      request.headers.get("x-forwarded-for") ||
      request.headers.get("x-real-ip") ||
      "unknown";
    const userAgent = request.headers.get("user-agent") || "unknown";

    const riskLevel =
      amount > 10000 ? "high" : amount > 1000 ? "medium" : "low";

    await sql`
      INSERT INTO audit_logs (
        user_id, action_type, action_description, ip_address, user_agent, 
        request_data, risk_level
      ) VALUES (
        ${userId}, 
        'transaction_create', 
        ${"User initiated " + transaction_type + " transaction"},
        ${clientIP},
        ${userAgent},
        ${JSON.stringify({ transaction_type, amount, recipient_account })},
        ${riskLevel}
      )
    `;

    // Create transaction
    const result = await sql`
      INSERT INTO transactions (
        user_id, transaction_type, amount, description, recipient_account, 
        reference_number, transaction_status
      ) VALUES (
        ${userId}, ${transaction_type}, ${amount}, ${description || null}, 
        ${recipient_account || null}, ${reference_number}, 'pending'
      )
      RETURNING *
    `;

    return Response.json({ transaction: result[0] });
  } catch (err) {
    console.error("POST /api/transactions error", err);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
