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
                realizador: {
                    type: String, 
                    required: [true, 'Why no real?']
                },
                description: {
                    type: String, 
                    required: [true, 'Why no desc?']
                },
                image: String,
                comments: [{
                    content: String, 
                    name: String
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
                duration: {
                    type: Number, 
                    required: [true, 'Why no duration?']
                },
                actors:{
                    type: String
                },
                release:{
                    type: Date,
                    // The dates of the first and last episodes of
                    // Star Trek: The Next Generation
                    min: '1950-01-01',
                    max: '2100-01-01'
                },
                writers:{
                    type: String
                }
            },
            { timestamps: false }
        );
    // creates a new model Tutorial using the defined schema above
    const Movie = mongoose.model("movie", schema);
    return Movie;
};