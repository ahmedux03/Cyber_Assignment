import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

// Get user profile
export async function GET() {
  try {
    const session = await auth();
    if (!session || !session.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    // Get user profile with security settings
    const profiles = await sql`
      SELECT 
        up.id,
        up.phone_number,
        up.address,
        up.date_of_birth,
        up.account_balance,
        up.account_number,
        up.routing_number,
        up.profile_picture_url,
        up.created_at,
        up.updated_at,
        ss.two_factor_enabled,
        ss.login_notifications,
        ss.transaction_alerts,
        ss.failed_login_attempts,
        ss.last_failed_login_at,
        ss.account_locked_until
      FROM user_profiles up
      LEFT JOIN security_settings ss ON up.user_id = ss.user_id
      WHERE up.user_id = ${userId}
      LIMIT 1
    `;

    const profile = profiles[0] || null;

    return Response.json({
      user: session.user,
      profile,
    });
  } catch (err) {
    console.error("GET /api/profile error", err);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// Update user profile
export async function PUT(request) {
  try {
    const session = await auth();
    if (!session || !session.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const body = await request.json();

    // Validate input data
    const { phone_number, address, date_of_birth, profile_picture_url } = body;

    // Input validation
    if (phone_number && typeof phone_number !== "string") {
      return Response.json(
        { error: "Invalid phone number format" },
        { status: 400 },
      );
    }

    if (address && typeof address !== "string") {
      return Response.json(
        { error: "Invalid address format" },
        { status: 400 },
      );
    }

    if (date_of_birth && !/^\d{4}-\d{2}-\d{2}$/.test(date_of_birth)) {
      return Response.json(
        { error: "Invalid date format. Use YYYY-MM-DD" },
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
        'profile_update', 
        'User updated profile information',
        ${clientIP},
        ${userAgent},
        ${JSON.stringify({ updated_fields: Object.keys(body) })},
        'low'
      )
    `;

    // Check if profile exists, if not create it
    const existingProfiles = await sql`
      SELECT id FROM user_profiles WHERE user_id = ${userId} LIMIT 1
    `;

    if (existingProfiles.length === 0) {
      // Create new profile
      const result = await sql`
        INSERT INTO user_profiles (
          user_id, phone_number, address, date_of_birth, profile_picture_url
        ) VALUES (
          ${userId}, ${phone_number || null}, ${address || null}, 
          ${date_of_birth || null}, ${profile_picture_url || null}
        )
        RETURNING *
      `;

      return Response.json({ profile: result[0] });
    } else {
      // Update existing profile
      const setClauses = [];
      const values = [];

      if (phone_number !== undefined) {
        setClauses.push(`phone_number = $${values.length + 1}`);
        values.push(phone_number);
      }
      if (address !== undefined) {
        setClauses.push(`address = $${values.length + 1}`);
        values.push(address);
      }
      if (date_of_birth !== undefined) {
        setClauses.push(`date_of_birth = $${values.length + 1}`);
        values.push(date_of_birth);
      }
      if (profile_picture_url !== undefined) {
        setClauses.push(`profile_picture_url = $${values.length + 1}`);
        values.push(profile_picture_url);
      }

      if (setClauses.length === 0) {
        return Response.json({ error: "No fields to update" }, { status: 400 });
      }

      const query = `
        UPDATE user_profiles 
        SET ${setClauses.join(", ")}, updated_at = NOW()
        WHERE user_id = $${values.length + 1}
        RETURNING *
      `;

      const result = await sql(query, [...values, userId]);

      return Response.json({ profile: result[0] });
    }
  } catch (err) {
    console.error("PUT /api/profile error", err);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
