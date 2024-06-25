import User from "../models/user.js";
import Order from "../models/OrderSchema.js";

export const placeOrder = async (req, res) => {
  try {
    const { orderDetails, paymentMethod, paymentDetails } = req.body;
    console.log(req.body,"LLLLLLL")
    const userId = req.userId;

    const status = paymentMethod === "Wallet" ? "Paid" : "pending";
    const statusLevel = status === "Paid" ? 1 : 0;

    const date = new Date();
    const delivery = new Date(date.getTime() + 10 * 24 * 60 * 60 * 1000);
    const deliveryDate = delivery
      .toLocaleString("en-US", {
        year: "numeric",
        month: "short",
        day: "2-digit",
      })
      .replace(/\//g, "-");

    // Validate paymentMethod and corresponding paymentDetails
    if (paymentMethod === "COD") {
      if (!paymentDetails.codDetails) {
        return res
          .status(400)
          .json({
            message:
              "COD details are required for Cash on Delivery payment method.",
          });
      }
    } else if (paymentMethod === "Bank Transfer") {
      if (!paymentDetails.bankTransferDetails) {
        return res
          .status(400)
          .json({
            message:
              "Bank Transfer details are required for Bank Transfer payment method.",
          });
      }
    } else {
      return res.status(400).json({ message: "Invalid payment method." });
    }

    const order = new Order({
      userId: userId,
      expected_delivery: deliveryDate,
      orderDetails,
      paymentMethod,
      paymentDetails: {
        codDetails:
          paymentMethod === "COD" ? paymentDetails.codDetails : undefined,
        bankTransferDetails:
          paymentMethod === "Bank Transfer"
            ? paymentDetails.bankTransferDetails
            : undefined,
      },
      orderStatus: status,
      statusLevel: statusLevel, 
    });
    
    const saveOrder = await order.save();

    if(saveOrder){
      res.status(200).json({ success: true, msg: 'successfully created order' });
    }

    
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ success: false, msg: 'Server Error' });
}
};



export default {
    placeOrder
}