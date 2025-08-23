import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

// Configure transporter with secure settings
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true, // Use SSL
  auth: {
    user: "forevish.care@gmail.com",
    pass: "bxxffzeojzswqyde", // App password
  },
  tls: {
    // Don't fail on invalid certs
    rejectUnauthorized: false,
  },
});

/**
 * API route for sending order confirmation emails
 */
export async function POST(request) {
  try {
    const orderData = await request.json();

    if (!orderData || !orderData.shipping || !orderData.items) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid order data",
        },
        { status: 400 }
      );
    }

    const { shipping, items, amounts, id: orderId } = orderData;
    const { email, fullName } = shipping;

    // Verify we have recipient email
    if (!email) {
      return NextResponse.json(
        {
          success: false,
          error: "Customer email is required",
        },
        { status: 400 }
      );
    }

    // Format order date
    const orderDate = new Date().toLocaleDateString("en-IN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    // Generate items HTML
    const itemsHtml = items
      .map(
        (item) => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #e5e5e5;">${
          item.name
        } (${item.size || "N/A"}/${item.color || "N/A"})</td>
        <td style="padding: 10px; border-bottom: 1px solid #e5e5e5; text-align: center;">${
          item.quantity
        }</td>
        <td style="padding: 10px; border-bottom: 1px solid #e5e5e5; text-align: right;">₹${(
          item.unitPrice || 0
        ).toFixed(2)}</td>
        <td style="padding: 10px; border-bottom: 1px solid #e5e5e5; text-align: right;">₹${(
          item.lineTotal || 0
        ).toFixed(2)}</td>
      </tr>
    `
      )
      .join("");

    // Format shipping address
    const shippingAddress = `
      ${shipping.addressLine1}<br>
      ${shipping.addressLine2 ? shipping.addressLine2 + "<br>" : ""}
      ${shipping.city}, ${shipping.state} ${shipping.postalCode}<br>
      ${shipping.country}
    `;

    // Email content
    const mailOptions = {
      from: '"Forevish" <forevish.care@gmail.com>',
      to: email,
      subject: `Order Confirmed! Your Forevish Order #${orderId}`,
      html: `
        <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; color: #333;">
          <div style="background-color: #f8fafc; padding: 20px; text-align: center; border-bottom: 3px solid #3b82f6;">
            <h1 style="margin: 0; color: #3b82f6;">Forevish</h1>
          </div>
          
          <div style="padding: 20px; background-color: #fff; border: 1px solid #e5e5e5;">
            <h2 style="color: #333; margin-bottom: 20px;">Thank you for your order!</h2>
            
            <p>Hello ${fullName},</p>
            
            <p>We're excited to let you know that your order has been confirmed and is being processed. You'll receive another notification when your order ships.</p>
            
            <div style="background-color: #f8fafc; border: 1px solid #e5e5e5; border-radius: 5px; padding: 15px; margin: 20px 0;">
              <div style="margin-bottom: 10px;">
                <strong>Order Number:</strong> #${orderId}<br>
                <strong>Order Date:</strong> ${orderDate}
              </div>
            </div>
            
            <h3 style="color: #333; margin-top: 30px; border-bottom: 1px solid #e5e5e5; padding-bottom: 10px;">Order Summary</h3>
            
            <table style="width: 100%; border-collapse: collapse;">
              <thead>
                <tr style="background-color: #f8fafc;">
                  <th style="padding: 10px; text-align: left;">Item</th>
                  <th style="padding: 10px; text-align: center;">Qty</th>
                  <th style="padding: 10px; text-align: right;">Price</th>
                  <th style="padding: 10px; text-align: right;">Total</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml}
              </tbody>
              <tfoot>
                <tr>
                  <td colspan="3" style="padding: 10px; text-align: right;"><strong>Subtotal:</strong></td>
                  <td style="padding: 10px; text-align: right;">₹${(
                    amounts.subtotal || 0
                  ).toFixed(2)}</td>
                </tr>
                <tr>
                  <td colspan="3" style="padding: 10px; text-align: right;"><strong>Shipping:</strong></td>
                  <td style="padding: 10px; text-align: right;">
                    ${
                      amounts.shipping === 0
                        ? "FREE"
                        : "₹" + (amounts.shipping || 0).toFixed(2)
                    }
                  </td>
                </tr>
                <tr>
                  <td colspan="3" style="padding: 10px; text-align: right;"><strong>Tax:</strong></td>
                  <td style="padding: 10px; text-align: right;">₹${(
                    amounts.tax || 0
                  ).toFixed(2)}</td>
                </tr>
                <tr style="background-color: #f8fafc;">
                  <td colspan="3" style="padding: 10px; text-align: right;"><strong>Total:</strong></td>
                  <td style="padding: 10px; text-align: right; font-weight: bold;">₹${(
                    amounts.total || 0
                  ).toFixed(2)}</td>
                </tr>
              </tfoot>
            </table>
            
            <h3 style="color: #333; margin-top: 30px; border-bottom: 1px solid #e5e5e5; padding-bottom: 10px;">Shipping Details</h3>
            
            <div style="margin-bottom: 20px;">
              <strong>Address:</strong><br>
              ${shippingAddress}
            </div>
            
            <div style="margin-bottom: 20px;">
              <strong>Contact:</strong><br>
              ${shipping.phone ? shipping.phone + "<br>" : ""}
              ${email}
            </div>
            
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e5e5; color: #666; font-size: 14px;">
              <p>If you have any questions about your order, please contact our customer service at <a href="mailto:forevish.care@gmail.com">forevish.care@gmail.com</a> or call us at +91 97858 95166.</p>
              
              <p>Thank you for shopping with Forevish!</p>
            </div>
          </div>
          
          <div style="background-color: #f8fafc; padding: 20px; text-align: center; font-size: 12px; color: #666;">
            <p>&copy; ${new Date().getFullYear()} Forevish. All rights reserved.</p>
            <p>118, Lal Ji Sand Ka Rasta, Jaipur, Rajasthan, India</p>
          </div>
        </div>
      `,
    };

    // Add additional error logging for debugging
    console.log("Attempting to send email to:", email);

    try {
      const result = await transporter.sendMail(mailOptions);
      console.log("Email sent successfully:", result.messageId);
      return NextResponse.json({
        success: true,
        messageId: result.messageId,
      });
    } catch (emailError) {
      console.error("Error sending email:", emailError);
      console.error("Error details:", JSON.stringify(emailError));
      return NextResponse.json(
        {
          success: false,
          error: emailError.message || "Failed to send email",
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error in email API:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Server error while sending email",
      },
      { status: 500 }
    );
  }
}
