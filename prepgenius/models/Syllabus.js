const mongoose = require('mongoose');

// Base schema for global syllabus topics
const globalSyllabusSchema = new mongoose.Schema({
  exam: { type: String, required: true },
  subject: { type: String, required: true },
  unitNumber: Number,
  unitName: String,
  chapterName: String,
  topicName: String,
  subtopic: String,
  difficulty: { type: String, enum: ["easy", "medium", "hard"], default: "medium" },
  weightage: { type: Number, default: 1 },
  isCompleted: { type: Boolean, default: false }, // Not used in smart planner directly
  createdAt: { type: Date, default: Date.now },
  lastStudiedAt: Date,
  revisionScore: { type: Number, default: 0 }
});

// Since global syllabus collections are static and shared among all users,
// we export individual models strictly tied to their respective seeding collections.

const SyllabusModels = {
  JeePhysics: mongoose.models.JeePhysicsSyllabus || mongoose.model('JeePhysicsSyllabus', globalSyllabusSchema, 'jee_physics_syllabus'),
  JeeChemistry: mongoose.models.JeeChemistrySyllabus || mongoose.model('JeeChemistrySyllabus', globalSyllabusSchema, 'jee_chemistry_syllabus'),
  JeeMaths: mongoose.models.JeeMathsSyllabus || mongoose.model('JeeMathsSyllabus', globalSyllabusSchema, 'jee_maths_syllabus'),
  
  NeetPhysics: mongoose.models.NeetPhysicsSyllabus || mongoose.model('NeetPhysicsSyllabus', globalSyllabusSchema, 'neet_physics_syllabus'),
  NeetChemistry: mongoose.models.NeetChemistrySyllabus || mongoose.model('NeetChemistrySyllabus', globalSyllabusSchema, 'neet_chemistry_syllabus'),
  NeetBiology: mongoose.models.NeetBiologySyllabus || mongoose.model('NeetBiologySyllabus', globalSyllabusSchema, 'neet_biology_syllabus')
};

/**
 * Helper to dynamically fetch the correct syllabus models based on exam.
 * @param {string} exam "JEE" or "NEET"
 * @returns {Array<mongoose.Model>} Array of Mongoose models to query
 */
function getSyllabusModelsForExam(exam) {
  if (exam === 'JEE') {
    return [SyllabusModels.JeePhysics, SyllabusModels.JeeChemistry, SyllabusModels.JeeMaths];
  } else if (exam === 'NEET') {
    return [SyllabusModels.NeetPhysics, SyllabusModels.NeetChemistry, SyllabusModels.NeetBiology];
  }
  return [];
}

module.exports = {
  ...SyllabusModels,
  getSyllabusModelsForExam
};
