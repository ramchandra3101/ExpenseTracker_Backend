
import receiptScan from '../services/Gemini.js';
import Category from '../models/Category.js';
import PaymentMethod from '../models/PaymentMethod.js';

export const previewReceipt = async (req, res) => {
    console.log('Preview receipt request:', req.file);
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No receipt image uploaded'
      });
    }
    
    try {
      const user_id = req.user.user_id;
      
      // Get the user's categories and payment methods
      const categories = await Category.findAll({
        where: { user_id }
      });
      
      const paymentMethods = await PaymentMethod.findAll({
        where: { user_id }
      });
      
      if (categories.length === 0 || paymentMethods.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Please set up categories and payment methods before scanning receipts'
        });
      }
    
      // Use your receiptScan service to analyze the receipt
      const extractedData = await receiptScan(
        req.file.path,
        categories,
        paymentMethods
      );
      
      
      // Return preview data without creating an expense
      return res.status(200).json({
        success: true,
        message: 'Receipt scanned successfully',
        data: extractedData
      });
    } catch (error) {
      console.error('Receipt preview error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to preview receipt scan',
        error: error.message
      });
    }
  };