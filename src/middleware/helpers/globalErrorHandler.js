import CustomError from './customErrors';

const globalErrorHandler = (error, req, res, next) => {
  if (res.headersSent) {
    return next(error);
  }

  if(error instanceof CustomError){
    return res.status(error.statusCode).json({ message: error.message})
  }

  const message = error.message || error.detail || error;
  return res.status(500).json({ message });
}

export default globalErrorHandler;