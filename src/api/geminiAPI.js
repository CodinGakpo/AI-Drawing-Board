import axios from "axios";

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

export const analyzeCanvasImage = async (base64Image) => {
    try {
        console.log("Base64 Image (First 100 chars):", base64Image.substring(0, 100));
        console.log("Using API Key:", GEMINI_API_KEY ? "Loaded" : "Not Loaded");

        const response = await axios.post(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
            {
                contents: [
                    {
                        parts: [
                            { text: "Describe the drawing in this image." },
                            {
                                inlineData: {
                                    mimeType: "image/png",
                                    data: base64Image
                                }
                            }
                        ]
                    }
                ]
            }
        );

        console.log("Full Response:", response.data);

        
        const description = response.data.candidates?.[0]?.content?.parts?.[0]?.text || "No description found.";
        return description;

    } catch (error) {
        console.error("Error analyzing canvas image:", error.response?.data || error.message);

        if (error.response) {
            console.log("Response Status:", error.response.status);
            console.log("Response Data:", error.response.data);
        }

        return "Unable to analyze image.";
    }
};
