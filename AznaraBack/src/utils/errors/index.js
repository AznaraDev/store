// class ClientError extends Error {
//     constructor(message, statusCode = 400){
//         super(message);
//         this.statusCode = statusCode;
//     }
// }
// module.exports = {ClientError};
class CustomError extends Error {
    constructor(message, status = 500) {
      super(message);
      this.name = this.constructor.name;
      this.status = status;
      Error.captureStackTrace(this, this.constructor);
    }
  }
  
  module.exports = CustomError;