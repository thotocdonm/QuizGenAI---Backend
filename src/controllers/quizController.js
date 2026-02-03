const Quiz = require("../models/Quiz");
const OpenAI = require("openai");

const client = new OpenAI({
    apiKey: process.env.GROQ_API_KEY,
    baseURL: "https://api.groq.com/openai/v1",
});

const generateQuiz = async (req, res) => {
    try {
        const { title, topic, numQuestions, difficulty } = req.body;
        const owner = req.user.id;

        // Tạo prompt cho AI
        const prompt = `Hệ thống phản hồi dưới dạng JSON thuần túy. 
        Không bao gồm markdown, không giải thích, không văn bản thừa.

        Nhiệm vụ: Tạo ${numQuestions} câu hỏi trắc nghiệm theo chủ đề "${title}" được mô tả "${topic}" với độ khó "${difficulty}".
        Ngôn ngữ: Tiếng Việt.

        Yêu cầu cấu trúc JSON chính xác như sau:
        {
        "questions": [
            {
            "text": "Nội dung câu hỏi?",
            "options": ["Đáp án A", "Đáp án B", "Đáp án C", "Đáp án D"],
            "correctAnswer": 0  // Chỉ số của đáp án đúng, từ 0 đến 3
            "explaination": "Giải thích đáp án đúng."
            }
        ]
        }`;

        // Call API AI
        const completion = await client.chat.completions.create({
            model: "llama-3.1-8b-instant",
            messages: [{ role: "user", content: prompt }],
            temperature: 0.7
        });

        const aiText = completion.choices[0].message.content;
        const jsonMatch = aiText.match(/\{[\s\S]*\}/);
        const questionsData = JSON.parse(jsonMatch[0]);

        // Lưu trữ quiz vào database
        const newQuiz = new Quiz({
            title,
            numQuestions,
            difficulty,
            owner,
            questions: questionsData.questions,
        }); 
        await newQuiz.save();

        res.status(201).json({ success: true, quizId: newQuiz._id });
    } catch (error) {
        console.error("Generate quiz error:", error);
        res.status(500).json({ success: false, message: "Lỗi khi tạo quiz bằng AI" });
    }
};

const getAllQuizzes = async (req, res) => {
    try {
        const quizzes = await Quiz.find({ owner: req.user.id });
        res.status(200).json(quizzes);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }   
};

const getQuizById = async (req, res) => {
    try {
        const quiz = await Quiz.findById(req.params.id);
        if (!quiz) return res.status(404).json({ success: false, message: "Quiz không tìm thấy" });

        if (quiz.owner.toString() !== req.user.id) {
            return res.status(403).json({ success: false, message: "Không có quyền truy cập quiz này" });
        }

        res.status(200).json(quiz);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getQuizPublic = async (req, res) => {
    try {
        const quiz = await Quiz.findById(req.params.id);
        if (!quiz) return res.status(404).json({ success: false, message: "Quiz không tìm thấy" });

        res.status(200).json({ 
            id: quiz._id,
            title: quiz.title,
            questions: quiz.questions.map(q => ({
                text: q.text,
                options: q.options,
            }))
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    generateQuiz,
    getQuizById,
    getQuizPublic,
    getAllQuizzes,
};