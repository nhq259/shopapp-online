
const asyncHandler = (fn) =>{
  return async (req,res,next) => {
    try {
      await fn(req,res,next)
    } catch (error) {
      console.error('Detail Error',error)
      console.log('Error Details',{message:error.message, stack: error.stack})
      return res.status(500).json({
        message: 'Internal Server Error',
        error: error
      })
    }
  }
}

module.exports = asyncHandler