const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  exam: String,
  subject: String,
  unitNumber: Number,
  unitName: String,
  chapterName: String,
  topicName: String,
  subtopic: String,
  difficulty: { type: String, enum: ["easy", "medium", "hard"] },
  weightage: Number,
  isCompleted: Boolean,
  createdAt: Date,
  lastStudiedAt: Date,
  revisionScore: Number
}, { collection: 'jee_maths_syllabus' });

const JeeMathsSyllabus = mongoose.models.JeeMathsSyllabus || mongoose.model('JeeMathsSyllabus', schema);

const syllabusDict = {
  1: {
    unit: "Sets Relations Functions",
    chapters: {
      "Sets": ["Representation of sets", "Empty, finite and infinite sets", "Subsets and power set", "Universal set and Venn diagrams", "Union, intersection and difference", "Complement and its properties", "Practical problems on union and intersection"],
      "Relations": ["Cartesian product of sets", "Domain and range of relation", "Reflexive, symmetric and transitive relations", "Equivalence relations", "Equivalence classes"],
      "Functions": ["Functions as mappings", "Domain, co-domain and range", "One-one (injective) functions", "Onto (surjective) functions", "Bijective functions", "Composition of functions", "Inverse of a function", "Real valued functions and their graphs"]
    }
  },
  2: {
    unit: "Complex Numbers",
    chapters: {
      "Complex Numbers and Quadratic Equations": ["Algebra of complex numbers", "Modulus and conjugate", "Argand plane and polar representation", "Euler form", "De Moivre's theorem", "Roots of unity (cube and nth roots)", "Triangle inequality", "Fundamental theorem of algebra", "Solutions of quadratic equations in complex number system", "Nature of roots", "Relation between roots and coefficients", "Equations reducible to quadratic form"]
    }
  },
  3: {
    unit: "Matrices and Determinants",
    chapters: {
      "Matrices": ["Types of matrices", "Algebra of matrices", "Transpose of a matrix", "Symmetric and skew-symmetric matrices", "Orthogonal matrices", "Elementary transformations", "Invertible matrices"],
      "Determinants": ["Expansion of determinants", "Properties of determinants", "Minors and cofactors", "Adjoint of a square matrix", "Inverse of a square matrix", "System of linear equations (Cramer's rule)", "Matrix method for linear equations", "Consistency and inconsistency"]
    }
  },
  4: {
    unit: "Permutations and Combinations",
    chapters: {
      "Permutations and Combinations": ["Fundamental principle of counting", "Factorial notation", "Permutations (arrangement)", "Permutations with repetitions", "Circular permutations", "Combinations (selection)", "Properties of nCr and nPr", "Division into groups", "Derangements", "Geometrical applications of P&C", "Multinomial theorem concept"]
    }
  },
  5: {
    unit: "Binomial Theorem",
    chapters: {
      "Binomial Theorem": ["Binomial theorem for positive integral index", "General term and middle term", "Term independent of x", "Greatest binomial coefficient", "Properties of binomial coefficients", "Binomial theorem for any index", "Applications of binomial theorem", "Approximations"]
    }
  },
  6: {
    unit: "Sequence and Series",
    chapters: {
      "Sequences and Series": ["Arithmetic Progression (A.P.)", "Sum of n terms of A.P.", "Properties of A.P.", "Arithmetic Mean (A.M.)", "Geometric Progression (G.P.)", "Sum of n terms of G.P.", "Infinite G.P.", "Geometric Mean (G.M.)", "Harmonic Progression (H.P.)", "Relation between A.M., G.M., and H.M.", "Arithmetico-Geometric Progression (A.G.P.)", "Summation of standard series (Sigma n, n2, n3)", "Method of differences"]
    }
  },
  7: {
    unit: "Limits Continuity Differentiation",
    chapters: {
      "Limits": ["Concept of limits", "Algebra of limits", "Standard limits (trigonometric, exponential, logarithmic)", "L'Hopital's Rule", "Expansion of functions", "Sandwich theorem"],
      "Continuity": ["Continuity at a point", "Continuity in an interval", "Algebra of continuous functions", "Types of discontinuity", "Intermediate value theorem"],
      "Differentiability": ["Derivatives and differentiability", "Relationship between continuity and differentiability", "Standard derivatives", "Chain rule", "Implicit differentiation", "Parametric differentiation", "Logarithmic differentiation", "Higher order derivatives"],
      "Applications of Derivatives": ["Rate of change of quantities", "Tangents and normals", "Monotonicity (increasing/decreasing features)", "Maxima and minima (first and second derivative tests)", "Global maxima and minima", "Rolle's and Lagrange's Mean Value Theorems", "Approximations"]
    }
  },
  8: {
    unit: "Integral Calculus",
    chapters: {
      "Indefinite Integrals": ["Integration as inverse of differentiation", "Standard integrals", "Integration by substitution", "Integration by parts", "Integration using partial fractions", "Trigonometric integrals", "Special integral forms"],
      "Definite Integrals": ["Fundamental theorem of calculus", "Properties of definite integrals", "Integration of piecewise functions", "Leibniz rule", "Definite integral as limit of a sum", "Reduction formulae"],
      "Applications of Integrals": ["Area under simple curves", "Area between two curves", "Area of bounded regions"]
    }
  },
  9: {
    unit: "Differential Equations",
    chapters: {
      "Differential Equations": ["Order and degree", "Formation of differential equations", "Variables separable method", "Homogeneous differential equations", "Linear differential equations", "Bernoulli's equation", "Orthogonal trajectories", "Applications in growth and decay"]
    }
  },
  10: {
    unit: "Coordinate Geometry",
    chapters: {
      "Straight Lines": ["Cartesian coordinate system", "Distance and section formulas", "Area of a triangle", "Slope of a line", "Various forms of line equations", "Angle between two lines", "Distance of a point from a line", "Family of lines", "Locus problems", "Centroid, Incenter, Orthocenter, Circumcenter"],
      "Conic Sections": ["Sections of a cone", "Standard equations", "The Circle: standard form, general form, tangents", "Parabola: standard form, focus, directrix, tangents", "Ellipse: standard form, eccentricity, foci, tangents", "Hyperbola: standard form, asymptotes, rectangular hyperbola, tangents", "Condition for tangency"]
    }
  },
  11: {
    unit: "3D Geometry",
    chapters: {
      "Three Dimensional Geometry": ["Coordinates of a point in space", "Distance and section formulas", "Direction cosines and direction ratios", "Equation of a line in space (vector and Cartesian)", "Angle between two lines", "Shortest distance between two skew lines", "Equation of a plane", "Angle between two planes", "Distance of a point from a plane", "Intersection of a line and a plane"]
    }
  },
  12: {
    unit: "Vector Algebra",
    chapters: {
      "Vectors": ["Scalars and Vectors", "Addition of vectors", "Components of a vector", "Scalar (dot) product and projection", "Vector (cross) product", "Scalar triple product", "Vector triple product", "Geometrical applications of vectors"]
    }
  },
  13: {
    unit: "Statistics and Probability",
    chapters: {
      "Statistics": ["Measures of central tendency (Mean, Median, Mode)", "Measures of dispersion", "Mean deviation", "Variance and standard deviation", "Analysis of frequency distributions"],
      "Probability": ["Random experiments and sample space", "Axiomatic approach to probability", "Addition theorem", "Conditional probability", "Multiplication theorem", "Independent events", "Total probability theorem", "Bayes' theorem", "Random variables and probability distribution", "Mean and variance of random variable", "Binomial distribution"]
    }
  },
  14: {
    unit: "Trigonometry",
    chapters: {
      "Trigonometric Functions": ["Angles and their measures (radians/degrees)", "Trigonometric ratios", "Trigonometric functions of sum and difference", "Multiple and sub-multiple angles", "Conditional identities", "Trigonometric equations", "General solutions"],
      "Inverse Trigonometric Functions": ["Domain and range of ITF", "Principal value branches", "Graphs of ITF", "Properties of inverse trigonometric functions", "Simplification of expressions"],
      "Properties of Triangles": ["Sine rule", "Cosine rule", "Projection rule", "Half angle formulas", "Area of a triangle", "Incircle and excircles", "Heights and distances"]
    }
  }
};

const documents = [];

Object.keys(syllabusDict).forEach(unitNum => {
  const unit = syllabusDict[unitNum];
  Object.keys(unit.chapters).forEach(chapterName => {
    const topics = unit.chapters[chapterName];
    topics.forEach((topicStr, index) => {
      // Alternate difficulty to simulate real data
      const diffStr = index % 3 === 0 ? "hard" : index % 2 === 0 ? "medium" : "easy";
      
      documents.push({
        exam: "JEE",
        subject: "Mathematics",
        unitNumber: parseInt(unitNum),
        unitName: unit.unit,
        chapterName: chapterName,
        topicName: topicStr,         // We assign the detailed topic string here representing a fine-grained topic/subtopic
        subtopic: topicStr,          // Redundant but meets requirement to not skip variables
        difficulty: diffStr,
        weightage: 1,
        isCompleted: false,
        createdAt: new Date(),
        lastStudiedAt: null,
        revisionScore: 0
      });
    });
  });
});

console.log(`Generated ${documents.length} JEE Maths topics.`);

async function seedDatabase() {
  const MONGO_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/prepgenius';
  try {
    console.log(`Connecting to MongoDB...`);
    await mongoose.connect(MONGO_URI);
    await JeeMathsSyllabus.deleteMany({});
    
    const result = await JeeMathsSyllabus.insertMany(documents);
    console.log(`✅ Successfully seeded ${result.length} topics into 'jee_maths_syllabus'.`);
  } catch (err) {
    console.error(`❌ Error during seeding:`, err);
  } finally {
    mongoose.connection.close();
  }
}

seedDatabase();
