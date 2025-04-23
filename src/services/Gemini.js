import {GoogleGenerativeAI} from '@google/generative-ai';
import fs from 'fs';
import dotenv from 'dotenv';
dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)

const receiptScan =async(imagePath, categories, paymentMethods)=>{
    try{  
        console.log('Image path:', imagePath);
        const model = genAI.getGenerativeModel({model:'gemini-2.0-flash'});
        const imageData = fs.readFileSync(imagePath);
        const imagebase64 = imageData.toString('base64');

        const categoryList = categories.map(cat =>
            `-ID: ${cat.category_id}, Name: ${cat.name}`
        ).join('\n');

        const paymentMethodList = paymentMethods.map(pm =>
            `-ID: ${pm.payment_method_id}, Name: ${pm.name}`
        ).join('\n');

        const prompt = `Analyze this receipt image and extract the following information in JSON format:
            - Vendor/merchant name
            - Total amount
            - Date of purchase (in YYYY-MM-DD format)
            - Items purchased with their prices (if visible)

            Based on the receipt contents, suggest the most appropriate category from the following options:
            ${categoryList}

            Also, suggest the most appropriate payment method from the following options:
            ${paymentMethodList}

            Format your response as a valid JSON object with these fields:
            {
                "category_id": "[category_id]",
                "payment_method_id": "[payment_method_id]",
                "amount": [total_amount_as_number],
                "description": "[vendor_name_and_brief_summary]",
                "expense_date": "[date_in_YYYY-MM-DD_format]",
                "receipt": "[image filename]",
                "is_recurring": false,
                "notes": "[list_of_items_if_available]"
            }
                    Do not include any other text outside the JSON object. Do not include receipt in the response. Use exactly these field names.
    `;

    const imagePart = {
        inlineData:{
            data:imagebase64,
            mimeType:'image/jpeg',
        }
    };

    const result = await model.generateContent([prompt, imagePart]);
    const response = result.response
    const text = response.text();

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if(!jsonMatch) {
        throw new Error("Failed to extract valid JSON from Gemini response");
    }
   

    const extractedData = JSON.parse(jsonMatch[0]);
    console.log('Extracted data:', extractedData);

    if(!extractedData.category_id || !extractedData.payment_method_id || !extractedData.amount || !extractedData.expense_date) {
        throw new Error("Missing required fields in extracted data");
    }


    return extractedData;

    }catch(error){
        console.error('Error using Gemini to scan recipt:', error);
        throw new Error("Gemini receipt scanning failed", error);
    }

}

export default receiptScan;