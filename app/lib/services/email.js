import nodemailer from "nodemailer";

// Configure transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    // user: process.env.NEXT_PUBLIC_EMAIL_USER || "Info.forevish@gmail.com",
    user: "forevish.care@gmail.com",
    // pass: process.env.NEXT_PUBLIC_EMAIL_PASSWORD, // Use app password for Gmail
    pass: "bxxffzeojzswqyde",
  },
});

/**
 * Sends an order confirmation email to the customer
 *
 * @param {Object} orderData - Order data containing items and customer information
 * @returns {Promise} - Email sending result
 */
export async function sendOrderConfirmationEmail(orderData) {
  const { shipping, items, amounts, id: orderId } = orderData;
  const { email, fullName } = shipping;

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
      } (${item.size}/${item.color})</td>
      <td style="padding: 10px; border-bottom: 1px solid #e5e5e5; text-align: center;">${
        item.quantity
      }</td>
      <td style="padding: 10px; border-bottom: 1px solid #e5e5e5; text-align: right;">₹${item.unitPrice.toFixed(
        2
      )}</td>
      <td style="padding: 10px; border-bottom: 1px solid #e5e5e5; text-align: right;">₹${item.lineTotal.toFixed(
        2
      )}</td>
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
    from: '"Forevish" <Info.forevish@gmail.com>',
    to: email,
    subject: `Order Confirmed! Your Forevish Order #${orderId}`,
    html: `
      <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; color: #333;">
        <div style="background-color: #f8fafc; padding: 20px; text-align: center; border-bottom: 3px solid #3b82f6;">
          <img src="https://forevish.com/logo.png" alt="Forevish" style="max-height: 60px;" />
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
                <td style="padding: 10px; text-align: right;">₹${amounts.subtotal.toFixed(
                  2
                )}</td>
              </tr>
              <tr>
                <td colspan="3" style="padding: 10px; text-align: right;"><strong>Shipping:</strong></td>
                <td style="padding: 10px; text-align: right;">
                  ${
                    amounts.shipping === 0
                      ? "FREE"
                      : "₹" + amounts.shipping.toFixed(2)
                  }
                </td>
              </tr>
              <tr>
                <td colspan="3" style="padding: 10px; text-align: right;"><strong>Tax:</strong></td>
                <td style="padding: 10px; text-align: right;">₹${amounts.tax.toFixed(
                  2
                )}</td>
              </tr>
              <tr style="background-color: #f8fafc;">
                <td colspan="3" style="padding: 10px; text-align: right;"><strong>Total:</strong></td>
                <td style="padding: 10px; text-align: right; font-weight: bold;">₹${amounts.total.toFixed(
                  2
                )}</td>
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
            <p>If you have any questions about your order, please contact our customer service at <a href="mailto:Info.forevish@gmail.com">Info.forevish@gmail.com</a> or call us at +91 97858 95166.</p>
            
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

  try {
    const result = await transporter.sendMail(mailOptions);
    console.log("Email sent:", result.messageId);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error("Error sending email:", error);
    return { success: false, error: error.message };
  }
}
