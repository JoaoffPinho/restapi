module.exports = (mongoose) => {
    const schema = mongoose.Schema(
            {
                title: { 
                    type: String,
                    unique: true, 
                    required: [true, 'Why no title?'] 
                },
                type: {
                    type: String,
                    enum: {
                        values: ['Action', 'Adventure', 'Sci-fi'],
                        messages: '{VALUE} is not supported'
                    },
                    required: [true, 'Why no type?']
                },
                image: String,
                comments: [{
                    content: String,
                    name: String
                }],
                points:{
                    type: Number, 
                    required: [true, 'Why no points?']
                },
                quizz:[{
                    question: String, 
                    answers:[{
                        answer: String, 
                        isTrue: Boolean,
                    }]
                }],
                ratings:[{
                    name: String,
                    rating:{
                        type: Number,
                        enum: {
                            values: [1, 2, 3, 4, 5],
                            messages: '{VALUE} is not supported'
                        },
                        required: [true, "No rating"]
                    }
                }],
            },
            { timestamps: false }
        );
    const Quizz = mongoose.model("quizzes", schema);
    return Quizz;
};