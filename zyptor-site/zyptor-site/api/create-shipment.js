
module.exports = async (req, res) => {
  res.setHeader("Allow", "POST");

  return res.status(503).json({
    success: false,
    error:
      "Automatic shipment creation is temporarily disabled until secure order processing is configured."
  });
};
