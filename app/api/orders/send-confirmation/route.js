import { NextResponse } from "next/server";
import { getOrderById } from "../../../lib/services/orders";
import { sendOrderConfirmationEmail } from "../../../lib/services/email";

export async function POST(request) {
  try {
    const { orderId } = await request.json();

    if (!orderId) {
      return NextResponse.json(
        { success: false, error: "Order ID required" },
        { status: 400 }
      );
    }

    // Get the order data
    const { success, data, error } = await getOrderById(orderId);

    if (!success) {
      return NextResponse.json({ success: false, error }, { status: 404 });
    }

    // Send the confirmation email
    const emailResult = await sendOrderConfirmationEmail(data);

    if (!emailResult.success) {
      return NextResponse.json(
        { success: false, error: emailResult.error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Order confirmation email sent",
    });
  } catch (error) {
    console.error("Error sending order confirmation email:", error);

    return NextResponse.json(
      { success: false, error: "Failed to send confirmation email" },
      { status: 500 }
    );
  }
}
