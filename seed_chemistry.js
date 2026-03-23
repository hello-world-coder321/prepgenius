const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  exam: String, // 'JEE' or 'NEET' based on script invocation
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
});

// The Chemistry syllabus covers Physical, Inorganic, Organic with 150+ deep topics
const chemistrySyllabus = [
  // PHYSICAL CHEMISTRY
  {
    unitNumber: 1, section: "Physical Chemistry",
    unitName: "Some Basic Concepts of Chemistry",
    chapters: { "Mole Concept": ["Matter definition and states", "Laws of chemical combination", "Dalton's atomic theory", "Atomic and molecular masses", "Mole concept and molar mass", "Percentage composition", "Empirical/Molecular formula", "Chemical stoichiometry and calculations"] }
  },
  {
    unitNumber: 2, section: "Physical Chemistry",
    unitName: "Atomic Structure",
    chapters: { "Atomic Structure": ["Discovery of electron, proton, neutron", "Atomic number and isotopes", "Thomson's model", "Rutherford's model", "Bohr's model and its limitations", "Dual nature of matter/light", "de Broglie's relationship", "Heisenberg uncertainty principle", "Quantum mechanical model concept", "Quantum numbers", "Shapes of s, p, d orbitals", "Aufbau principle, Pauli's exclusion principle, Hund's rule", "Electronic configurations of atoms"] }
  },
  {
    unitNumber: 3, section: "Physical Chemistry",
    unitName: "States of Matter",
    chapters: { "Gases and Liquids": ["Three states of matter", "Intermolecular interactions", "Boyle's law", "Charles' law", "Gay Lussac's law", "Avogadro's law", "Ideal behaviour", "Empirical gas equation", "Avogadro number", "Ideal gas equation", "Kinetic energy and molecular speeds", "Kinetic theory of gases", "Liquefaction of gases", "Vapour pressure", "Viscosity and surface tension"] }
  },
  {
    unitNumber: 4, section: "Physical Chemistry",
    unitName: "Chemical Thermodynamics",
    chapters: { "Thermodynamics": ["System and surroundings", "Work, heat, energy, extensive/intensive properties", "State functions", "First law of thermodynamics", "Internal energy and enthalpy", "Heat capacity and specific heat", "Hess's law of constant heat summation", "Enthalpy of bond dissociation, combustion, formation", "Atomization, sublimation, phase transition enthalpies", "Second law of thermodynamics", "Entropy as state function", "Gibbs energy change", "Spontaneity criteria", "Third law of thermodynamics"] }
  },
  {
    unitNumber: 5, section: "Physical Chemistry",
    unitName: "Equilibrium",
    chapters: {
      "Chemical Equilibrium": ["Equilibrium in physical and chemical processes", "Dynamic nature of equilibrium", "Law of mass action", "Equilibrium constant Kp/Kc", "Factors affecting equilibrium", "Le Chatelier's principle"],
      "Ionic Equilibrium": ["Ionization of acids and bases", "Strong and weak electrolytes", "Degree of ionization", "Polybasic acids", "Acid strength", "pH scale", "Buffer solutions", "Henderson equation", "Solubility product", "Common ion effect"]
    }
  },
  {
    unitNumber: 6, section: "Physical Chemistry",
    unitName: "Redox Reactions and Electrochemistry",
    chapters: { "Electrochemistry": ["Oxidation and reduction concepts", "Redox reactions", "Oxidation number rules", "Balancing redox reactions", "Electrolytic conduction", "Kohlrausch's Law", "Electrochemical cells", "Galvanic cells", "Electrode potential", "Standard electrode potential", "Nernst equation", "Relation between Gibbs energy and EMF", "Dry cell/Lead accumulator", "Fuel cells", "Corrosion"] }
  },
  {
    unitNumber: 7, section: "Physical Chemistry",
    unitName: "Chemical Kinetics",
    chapters: { "Kinetics": ["Rate of a chemical reaction", "Factors affecting reaction rate", "Order and molecularity", "Rate law and specific rate constant", "Integrated rate equations (zero and first order)", "Half-life of reactions", "Collision theory of rates", "Activation energy", "Arrhenius equation"] }
  },
  {
    unitNumber: 8, section: "Physical Chemistry",
    unitName: "Surface Chemistry",
    chapters: { "Surface Chemistry": ["Adsorption physisorption vs chemisorption", "Factors affecting adsorption of gases", "Catalysis: homogeneous and heterogeneous", "Colloidal state", "True solutions vs Colloids", "Lyophilic and lyophobic colloids", "Properties of colloids (Tyndall, Brownian, Electrophoresis)", "Coagulation", "Emulsions"] }
  },

  // INORGANIC CHEMISTRY
  {
    unitNumber: 9, section: "Inorganic Chemistry",
    unitName: "Classification of Elements and Periodicity",
    chapters: { "Periodic Table": ["Significance of classification", "Brief history of periodic table", "Modern periodic law", "Long form of periodic table", "s, p, d, f block elements", "Periodic trends (Atomic radii, Ionic radii)", "Ionization enthalpy", "Electron gain enthalpy", "Electronegativity", "Valency periodicity"] }
  },
  {
    unitNumber: 10, section: "Inorganic Chemistry",
    unitName: "Chemical Bonding",
    chapters: { "Chemical Bonding": ["Valence electrons", "Ionic bond formulation", "Covalent bond", "Bond parameters", "Lewis structure", "Polar character of covalent bond", "VSEPR theory", "Valence bond theory", "Hybridization (s, p, d)", "Molecular orbital theory homonuclear", "Hydrogen bonding"] }
  },
  {
    unitNumber: 11, section: "Inorganic Chemistry",
    unitName: "Hydrogen",
    chapters: { "Hydrogen": ["Position of hydrogen in periodic table", "Isotopes of hydrogen", "Preparation and properties of Hydrogen", "Hydrides (ionic, covalent, interstitial)", "Physical and chemical properties of water", "Heavy water", "Hydrogen peroxide preparation/properties"] }
  },
  {
    unitNumber: 12, section: "Inorganic Chemistry",
    unitName: "s-Block Elements",
    chapters: { "s-Block": ["Group 1 and Group 2 elements", "Electronic configuration s-block", "Occurrence and anomalous properties", "Diagonal relationship", "Chemical reactivity trends", "Preparation of Sodium Carbonate/NaCl/NaOH", "Biological importance of Na, K, Mg, Ca"] }
  },
  {
    unitNumber: 13, section: "Inorganic Chemistry",
    unitName: "p-Block Elements",
    chapters: {
      "Group 13 to 18": ["General introduction p-block", "Electronic configuration p-block", "Group 13 anomalous properties", "Boron compounds (Borax, Boric acid)", "Group 14 Carbon/Silicon", "Allotropes of carbon", "Group 15 Nitrogen chemistry", "Ammonia and Nitric acid", "Group 16 Oxygen and Sulphur", "Sulphuric acid", "Group 17 Halogens", "Hydrogen chloride", "Interhalogen compounds", "Group 18 Noble gases"]
    }
  },
  {
    unitNumber: 14, section: "Inorganic Chemistry",
    unitName: "d and f Block Elements",
    chapters: { "d and f Block": ["General introduction d-block", "Electronic configuration d-block", "Characteristics of transition metals", "Trends in melting points/atomic radii", "Ionization enthalpy d-block", "Oxidation states d-block", "Preparation KMnO4 and K2Cr2O7", "Lanthanoids electronic config/oxidation states", "Lanthanoid contraction", "Actinoids general features"] }
  },
  {
    unitNumber: 15, section: "Inorganic Chemistry",
    unitName: "Coordination Compounds",
    chapters: { "Coordination Compounds": ["Introduction to coordination compounds", "Ligands and coordination number", "Color and magnetic properties", "Nomenclature of coordination compounds", "Isomerism (structural and stereo)", "Bonding (Werner, VBT, CFT)", "Importance in qualitative analysis and biological systems"] }
  },
  {
    unitNumber: 16, section: "Inorganic Chemistry",
    unitName: "Environmental Chemistry",
    chapters: { "Environment": ["Environmental pollution (air, water, soil)", "Chemical reactions in atmosphere", "Smog and major atmospheric pollutants", "Acid rain", "Ozone and its reactions", "Ozone layer depletion", "Greenhouse effect and global warming", "Green chemistry as an alternative framework"] }
  },

  // ORGANIC CHEMISTRY
  {
    unitNumber: 17, section: "Organic Chemistry",
    unitName: "Some Basic Principles of Organic Chemistry",
    chapters: { "Organic Principles": ["Tetravalence of carbon", "Shapes of simple molecules", "Classification of organic compounds", "IUPAC nomenclature", "Electronic displacements (Inductive, Electromeric, Resonance, Hyperconjugation)", "Homolytic and heterolytic fission", "Carbocations, carbanions, free radicals", "Electrophiles and nucleophiles"] }
  },
  {
    unitNumber: 18, section: "Organic Chemistry",
    unitName: "Hydrocarbons",
    chapters: {
      "Alkanes and Alkenes": ["Alkanes nomenclature/isomerism", "Physical properties alkanes", "Free radical halogenation", "Combustion and pyrolysis", "Alkenes nomenclature", "Geometrical isomerism alkenes", "Preparation of alkenes", "Markovnikov's addition", "Ozonolysis and polymerization"],
      "Alkynes and Aromatic": ["Alkynes nomenclature", "Acidic character of alkynes", "Addition reactions alkynes", "Aromatic hydrocarbons intro", "Benzene resonance", "Electrophilic substitution (Nitration, halogenation, sulfonation, Friedel-Crafts)", "Directive influence in monosubstituted benzene", "Carcinogenicity and toxicity"]
    }
  },
  {
    unitNumber: 19, section: "Organic Chemistry",
    unitName: "Haloalkanes and Haloarenes",
    chapters: { "Halides": ["Haloalkanes nomenclature/classification", "Nature of C-X bond", "Physical properties mechanism of substitution", "Optical rotation", "Haloarenes nature of C-X bond", "Substitution reactions in haloarenes", "Uses of Dichloromethane, Chloroform, Freons, DDT"] }
  },
  {
    unitNumber: 20, section: "Organic Chemistry",
    unitName: "Alcohols, Phenols and Ethers",
    chapters: { "Alcohols/Phenols": ["Alcohols nomenclature/preparation", "Physical and chemical properties alcohols", "Mechanism of dehydration", "Uses of Methanol/Ethanol", "Phenols nomenclature", "Acidic nature of phenol", "Electrophilic substitution in phenols", "Ethers nomenclature and preparation", "Properties of ethers"] }
  },
  {
    unitNumber: 21, section: "Organic Chemistry",
    unitName: "Aldehydes, Ketones and Carboxylic Acids",
    chapters: { "Carbonyls": ["Aldehydes/Ketones nomenclature", "Preparation of aldehydes/ketones", "Physical and chemical properties", "Nucleophilic addition mechanism", "Reactivity of alpha hydrogen", "Carboxylic Acids nomenclature", "Acidic nature of carboxylic acids", "Preparation and uses of carboxylic acids"] }
  },
  {
    unitNumber: 22, section: "Organic Chemistry",
    unitName: "Organic Compounds containing Nitrogen",
    chapters: { "Amines": ["Amines nomenclature/classification", "Structure of amines", "Preparation of amines", "Physical and chemical properties", "Identification of 1,2,3 amines", "Cyanides and Isocyanides importance", "Diazonium salts preparation", "Chemical reactions of diazonium salts"] }
  },
  {
    unitNumber: 23, section: "Organic Chemistry",
    unitName: "Biomolecules",
    chapters: { "Biomolecules": ["Carbohydrates classification (aldoses/ketoses)", "Monosaccharides (Glucose/Fructose)", "D-L configuration", "Proteins/Amino acids", "Peptide bond and Polypeptides", "Primary/Secondary/Tertiary/Quaternary structure of proteins", "Denaturation of proteins", "Enzymes", "Vitamins classification and functions", "Nucleic Acids DNA and RNA"] }
  },
  {
    unitNumber: 24, section: "Organic Chemistry",
    unitName: "Polymers",
    chapters: { "Polymers": ["Classification of polymers", "General methods of polymerization", "Addition and condensation polymerization", "Copolymerization", "Natural and synthetic rubber", "Biodegradable polymers", "Important polymers (Polythene, Nylon, Polyesters, Bakelite)"] }
  },
  {
    unitNumber: 25, section: "Organic Chemistry",
    unitName: "Chemistry in Everyday Life",
    chapters: { "Everyday Chemistry": ["Chemicals in medicines", "Analgesics/Tranquilizers", "Antiseptics/Disinfectants", "Antimicrobials/Antifertility drugs", "Antibiotics/Antacids", "Chemicals in food (preservatives, artificial sweetening)", "Cleansing agents (soaps and detergents)", "Cleansing action mechanism"] }
  }
];

function generateDocs(exam, collectionName) {
  const docs = [];
  chemistrySyllabus.forEach(unit => {
    Object.keys(unit.chapters).forEach(chapterName => {
      const topics = unit.chapters[chapterName];
      topics.forEach((topicStr, index) => {
        docs.push({
          exam: exam,
          subject: "Chemistry",
          unitNumber: unit.unitNumber,
          unitName: `${unit.section}: ${unit.unitName}`,
          chapterName: chapterName,
          topicName: topicStr,
          subtopic: topicStr,
          difficulty: index % 3 === 0 ? "hard" : index % 2 === 0 ? "medium" : "easy",
          weightage: 1,
          isCompleted: false,
          createdAt: new Date(),
          lastStudiedAt: null,
          revisionScore: 0
        });
      });
    });
  });
  return docs;
}

// Ensure both models are registered
const JeeChemSyllabus = mongoose.models.JeeChemSyllabus || mongoose.model('JeeChemSyllabus', schema, 'jee_chemistry_syllabus');
const NeetChemSyllabus = mongoose.models.NeetChemSyllabus || mongoose.model('NeetChemSyllabus', schema, 'neet_chemistry_syllabus');

async function seedDatabase() {
  const MONGO_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/prepgenius';
  try {
    await mongoose.connect(MONGO_URI);
    
    // Seed JEE Chemistry
    const jeeDocs = generateDocs("JEE", "jee_chemistry_syllabus");
    await JeeChemSyllabus.deleteMany({});
    const jeeRes = await JeeChemSyllabus.insertMany(jeeDocs);
    console.log(`✅ Successfully seeded ${jeeRes.length} topics into 'jee_chemistry_syllabus'.`);

    // Seed NEET Chemistry
    const neetDocs = generateDocs("NEET", "neet_chemistry_syllabus");
    await NeetChemSyllabus.deleteMany({});
    const neetRes = await NeetChemSyllabus.insertMany(neetDocs);
    console.log(`✅ Successfully seeded ${neetRes.length} topics into 'neet_chemistry_syllabus'.`);
    
  } catch (err) {
    console.error(`❌ Error during Chemistry seeding:`, err);
  } finally {
    mongoose.connection.close();
  }
}

seedDatabase();
