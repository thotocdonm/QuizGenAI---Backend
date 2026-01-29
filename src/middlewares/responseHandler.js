const responseHandler = (req, res, next) => {
  res.success = (data, message = "Success") => {
    return res.status(200).json({
      success: "true",
      message,
      data,
    });
  };

  res.error = (message = "Internal Server Error", status = 500) => {
    return res.status(status).json({
      success: "false",
      message,
      data: null,
    });
  };
  next();
};

module.exports = responseHandler;
