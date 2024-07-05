import Exchange from "../models/ExchangeSchema.js";

//genrate order id
function generateRandomPrefix(length) {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let result = "";
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    result += characters[randomIndex];
  }
  return result;
}

function generateExchangeID() {
  const prefix = generateRandomPrefix(2);
  const timestamp = Date.now().toString();
  const randomNumber = Math.floor(1000 + Math.random() * 9000).toString();
  const orderID = `${prefix}${timestamp.slice(-6)}${randomNumber}`;
  return orderID;
}

export const DollerExchange = async (req, res) => {
  try {
    const { ExchangeDetails, paymentMethod, codDetails, bankTransferDetails } =
      req.body;
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
          message:
            "COD details are required for Cash on Delivery payment method.",
        });
      }
    } else if (paymentMethod === "Bank Transfer") {
      if (!bankTransferDetails) {
        return res.status(400).json({
          message:
            "Bank Transfer details are required for Bank Transfer payment method.",
        });
      }
    } else {
      return res.status(400).json({ message: "Invalid payment method." });
    }

    const exchangeID = generateExchangeID();

    const Exchanges = new Exchange({
      exchangeId: exchangeID,
      userId,
      expected_delivery: deliveryDate,
      ExchangeDetails,
      paymentMethod,
      codDetails: paymentMethod === "COD" ? codDetails : undefined,
      bankTransferDetails:
        paymentMethod === "Bank Transfer" ? bankTransferDetails : undefined,
      orderStatus: status,
      statusLevel,
    });

    const myExchange = await Exchanges.save();
    if (myExchange) {
      res
        .status(200)
        .json({
          success: true,
          msg: "Successfully Exchange ",
          data: myExchange,
          exchangeId: myExchange.exchangeId,
        });
    }
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ success: false, msg: "Server Error" });
  }
};

export default {
  DollerExchange,
};
