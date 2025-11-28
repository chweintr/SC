import { AccessToken } from "livekit-server-sdk";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    const roomName = "squatch-room-" + Math.random().toString(36).substring(7);
    const participantName = "User-" + Math.random().toString(36).substring(7);

    // MOCK AUTH: Determine user tier
    // In a real app, you'd check session/auth here.
    // For now, we'll look for a query param ?tier=paid, default to free.
    const searchParams = req.nextUrl.searchParams;

    // SECURITY NOTE: In production, you MUST validate the user's session here.
    // Example with NextAuth:
    // const session = await getServerSession(authOptions);
    // if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // For now, we use a query param to simulate tiers for testing/demo purposes.
    // Ideally, this should come from your database based on the authenticated user.
    const tier = searchParams.get("tier") === "paid" ? "paid" : "free";

    const apiKey = process.env.LIVEKIT_API_KEY;
    const apiSecret = process.env.LIVEKIT_API_SECRET;
    const wsUrl = process.env.LIVEKIT_URL;

    if (!apiKey || !apiSecret || !wsUrl) {
        console.error("Missing LiveKit environment variables");
        return NextResponse.json(
            { error: "Server misconfigured" },
            { status: 500 }
        );
    }

    const at = new AccessToken(apiKey, apiSecret, {
        identity: participantName,
        // Token valid for 10 minutes to reduce risk of reuse
        ttl: "10m",
        metadata: JSON.stringify({
            tier: tier, // "free" or "paid"
        }),
    });

    at.addGrant({
        roomJoin: true,
        room: roomName,
        // Only allow publishing if paid? Or limit duration?
        // For now, we allow full access but metadata controls the agent's behavior.
        canPublish: true,
        canSubscribe: true,
    });

    return NextResponse.json({
        token: await at.toJwt(),
        roomName,
        tier,
        serverUrl: wsUrl,
    });
}
