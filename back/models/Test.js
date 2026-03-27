const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  text:          { type: String, required: true },
  options:       [{ type: String, required: true }],   // 4 variants
  correctIndex:  { type: Number, required: true },     // 0-based index
  explanation:   { type: String, default: '' },
});

const testSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
    },
    description: { type: String, default: '' },
    category: {
      type: String,
      required: true,
      trim: true,
    },
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard'],
      default: 'medium',
    },
    questions:  [questionSchema],
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    isPublished: { type: Boolean, default: true },
    timeLimitMin: { type: Number, default: 0 }, // 0 = no limit
  },
  { timestamps: true, toJSON: { virtuals: true } }
);

// Virtual: number of questions
testSchema.virtual('questionCount').get(function () {
  return this.questions.length;
});

// Hide correctIndex from client response when fetching quiz to take
testSchema.methods.toQuiz = function () {
  const obj = this.toObject();
  obj.questions = obj.questions.map(({ text, options, _id }) => ({ text, options, _id }));
  return obj;
};

module.exports = mongoose.model('Test', testSchema);
