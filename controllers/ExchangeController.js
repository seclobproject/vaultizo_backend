import Exchange from "../models/ExchangeSchema.js";



export const DollerExchange = async(req,res)=> {
    try {
        
    
    const {ExchangeDetails,paymentMethod,codDetails,bankTransferDetails} = req.body
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
        if (!codDetails) {
          return res.status(400).json({
            message: "COD details are required for Cash on Delivery payment method.",
          });
        }
      } else if (paymentMethod === "Bank Transfer") {
        if (!bankTransferDetails) {
          return res.status(400).json({
            message: "Bank Transfer details are required for Bank Transfer payment method.",
          });
        }
      } else {
        return res.status(400).json({ message: "Invalid payment method." });
      }

      const Exchanges = new Exchange({
        userId,
        expected_delivery: deliveryDate,
        ExchangeDetails,
        paymentMethod,
        codDetails: paymentMethod === "COD" ? codDetails : undefined,
        bankTransferDetails: paymentMethod === "Bank Transfer" ? bankTransferDetails : undefined,
        orderStatus: status,
        statusLevel
      });

      const savedOrder = await Exchanges.save();
      if (savedOrder) {
        res.status(200).json({ success: true, msg: 'Successfully Exchange ' });
      }
    } catch (error) {
      console.log(error.message);
      res.status(500).json({ success: false, msg: 'Server Error' });
    }


}


export default {
    DollerExchange
  };