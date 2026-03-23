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
}, { collection: 'neet_biology_syllabus' });

const NeetBiologySyllabus = mongoose.models.NeetBiologySyllabus || mongoose.model('NeetBiologySyllabus', schema);

const biologySyllabus = [
  {
    unitNumber: 1,
    unitName: "Diversity in Living World",
    chapters: {
      "The Living World": ["What is Living?", "Biodiversity", "Need for classification", "Three domains of life", "Systematics", "Taxonomy", "Species concept", "Taxonomical hierarchy", "Binomial nomenclature", "Tools for study of taxonomy", "Museums, Zoos, Herbaria, Botanical gardens"],
      "Biological Classification": ["Five kingdom classification", "Salient features and classification of Monera", "Protista features and classification", "Fungi features and classification", "Lichens", "Viruses and Viroids", "Prions"],
      "Plant Kingdom": ["Salient features of Algae", "Bryophytes", "Pteridophytes", "Gymnosperms", "Angiosperms", "Plant life cycles and alternation of generations"],
      "Animal Kingdom": ["Basis of classification", "Non-chordates (Porifera to Echinodermata)", "Hemichordata", "Chordata characteristics", "Classes of Chordata", "Vertebrata (Cyclostomata to Mammalia)"]
    }
  },
  {
    unitNumber: 2,
    unitName: "Structural Organisation in Animals and Plants",
    chapters: {
      "Morphology of Flowering Plants": ["Morphology of root", "Morphology of stem", "Morphology of leaf", "Inflorescence", "Flower parts", "Fruit and seed", "Semi-technical description of typical flowering plant", "Families Solanaceae, Fabaceae, Liliaceae"],
      "Anatomy of Flowering Plants": ["Meristematic tissues", "Permanent tissues", "Tissue systems", "Anatomy of dicot root, stem, leaf", "Anatomy of monocot root, stem, leaf", "Secondary growth intro"],
      "Structural Organisation in Animals": ["Animal tissues (Epithelial)", "Connective tissue", "Muscle tissue", "Neural tissue", "Morphology and anatomy of Frog, Earthworm, Cockroach (overview)"]
    }
  },
  {
    unitNumber: 3,
    unitName: "Cell Structure and Function",
    chapters: {
      "Cell: The Unit of Life": ["Cell theory", "Prokaryotic cells", "Eukaryotic cells", "Cell envelope and modifications", "Plasma membrane structure (Fluid mosaic)", "Endomembrane system", "ER and Golgi", "Lysosomes and Vacuoles", "Mitochondria", "Plastids/Chloroplasts", "Ribosomes", "Cytoskeleton", "Cilia and Flagella", "Centrosome and Centrioles", "Nucleus structure"],
      "Biomolecules": ["Chemical constituents of living cells", "Primary and secondary metabolites", "Proteins structure", "Carbohydrates", "Lipids", "Nucleic acids", "Nature of bond linking monomers", "Dynamic state of body constituents", "Metabolic basis for living", "Enzymes properties and action"],
      "Cell Cycle and Division": ["Cell cycle phases", "Mitosis and its significance", "Meiosis events", "Significance of Meiosis"]
    }
  },
  {
    unitNumber: 4,
    unitName: "Plant Physiology",
    chapters: {
      "Transport in Plants": ["Means of transport (Diffusion, Osmosis, Active/Passive)", "Plant-water relations", "Water potential", "Plasmolysis", "Long distance transport of water", "Absorption of water", "Transpiration pull", "Phloem transport", "Mass flow hypothesis"],
      "Mineral Nutrition": ["Essential minerals", "Macro and micronutrients", "Hydroponics", "Deficiency symptoms", "Toxicity of micronutrients", "Mechanism of absorption of elements", "Nitrogen cycle", "Biological nitrogen fixation"],
      "Photosynthesis": ["Early experiments", "Site of photosynthesis", "Pigments involved", "Light reaction", "Electron transport", "Photophosphorylation", "Chemiosmotic hypothesis", "C3 and C4 pathways", "Photorespiration", "Factors affecting photosynthesis"],
      "Respiration in Plants": ["Do plants breathe?", "Glycolysis", "Fermentation", "Aerobic respiration", "Krebs cycle", "Electron Transport System (ETS)", "Oxidative phosphorylation", "Respiratory balance sheet", "Amphibolic pathway", "Respiratory quotient"],
      "Plant Growth and Development": ["Seed germination", "Phases of plant growth", "Growth rates", "Conditions for growth", "Differentiation, dedifferentiation, redifferentiation", "Development", "Plant growth regulators (Auxins, Gibberellins, Cytokinins, Ethylene, ABA)", "Photoperiodism", "Vernalisation"]
    }
  },
  {
    unitNumber: 5,
    unitName: "Human Physiology",
    chapters: {
      "Digestion and Absorption": ["Digestive system gross anatomy", "Alimentary canal", "Digestive glands", "Digestion of food", "Absorption of digested products", "Disorders of digestive system (PEM, indigestion, jaundice, vomiting, diarrhea, constipation)"],
      "Breathing and Exchange of Gases": ["Respiratory organs", "Human respiratory system", "Mechanism of breathing", "Exchange of gases", "Transport of O2 and CO2", "Regulation of respiration", "Disorders (Asthma, Emphysema, Occupational respiratory disorders)"],
      "Body Fluids and Circulation": ["Blood composition", "Blood groups (ABO and Rh)", "Coagulation of blood", "Lymph", "Human circulatory system structure", "Cardiac cycle", "ECG", "Double circulation", "Regulation of cardiac activity", "Disorders (Hypertension, CAD, Angina, Heart failure)"],
      "Excretory Products and Elimination": ["Modes of excretion (Ammonotelism, Ureotelism, Uricotelism)", "Human excretory system anatomy", "Urine formation", "Function of tubules", "Counter current mechanism", "Regulation of kidney function", "Micturition", "Role of other organs in excretion", "Disorders (Uremia, Renal calculi, Nephritis, Artificial kidney)"],
      "Locomotion and Movement": ["Types of movement", "Muscle (Skeletal, Smooth, Cardiac)", "Structure of contractile proteins", "Mechanism of muscle contraction", "Skeletal system", "Joints", "Disorders (Myasthenia gravis, Tetany, Muscular dystrophy, Arthritis, Osteoporosis, Gout)"],
      "Neural Control and Coordination": ["Neurons and nerves", "Nervous system in humans", "Central nervous system (Brain, Spinal cord)", "Peripheral nervous system", "Generation and conduction of nerve impulse", "Synapse transmission", "Reflex action", "Sensory reception and processing (Eye, Ear)"],
      "Chemical Coordination and Integration": ["Endocrine glands and hormones", "Human endocrine system", "Hypothalamus", "Pituitary, Pineal, Thyroid, Parathyroid glands", "Thymus, Adrenal, Pancreas, Gonads", "Mechanism of hormone action", "Role of hormones as messengers and regulators", "Disorders (Dwarfism, Acromegaly, Cretinism, Goiter, Exophthalmic goiter, Diabetes, Addison's disease)"]
    }
  },
  {
    unitNumber: 6,
    unitName: "Reproduction",
    chapters: {
      "Reproduction in Organisms": ["Reproduction types", "Asexual reproduction methods", "Sexual reproduction events", "Pre-fertilisation, Fertilisation, Post-fertilisation events"],
      "Sexual Reproduction in Flowering Plants": ["Flower structure", "Microsporogenesis", "Megasporogenesis", "Pollination types, agencies and examples", "Outbreeding devices", "Pollen-Pistil interaction", "Double fertilization", "Post fertilization events", "Development of endosperm and embryo", "Seed development", "Fruit formation", "Apomixis and polyembryony"],
      "Human Reproduction": ["Male reproductive system", "Female reproductive system", "Gametogenesis (Spermatogenesis, Oogenesis)", "Menstrual cycle", "Fertilisation and implantation", "Pregnancy and embryonic development", "Placenta formation", "Parturition and lactation"],
      "Reproductive Health": ["Need for reproductive health", "STD prevention", "Birth control - Need and Methods", "Contraception and Medical Termination of Pregnancy (MTP)", "Amniocentesis", "Infertility and assisted reproductive technologies (IVF, ZIFT, GIFT)"]
    }
  },
  {
    unitNumber: 7,
    unitName: "Genetics and Evolution",
    chapters: {
      "Principles of Inheritance and Variation": ["Mendel's laws of inheritance", "Deviations from Mendelism (Incomplete dominance, Co-dominance, Multiple alleles)", "Pleiotropy", "Polygenic inheritance", "Chromosome theory of inheritance", "Linkage and crossing over", "Sex determination", "Mutation and Pedigree analysis", "Mendelian disorders (Hemophilia, Color blindness, Sickle-cell anemia, Phenylketonuria, Thalassemia)", "Chromosomal disorders (Down's, Turner's, Klinefelter's syndromes)"],
      "Molecular Basis of Inheritance": ["Structure of DNA and RNA", "DNA packaging", "Search for genetic material (Griffith, Hershey-Chase)", "RNA World", "DNA replication", "Transcription", "Genetic code", "Translation", "Regulation of gene expression", "Lac operon", "Human Genome Project", "DNA fingerprinting"],
      "Evolution": ["Origin of life", "Biological evolution and evidences", "Paleontology, comparative anatomy, embryology, molecular evidence", "Darwin's contribution", "Modern Synthetic Theory of Evolution", "Mechanism of evolution: Variation and Natural Selection", "Types of natural selection", "Gene flow and genetic drift", "Hardy-Weinberg's principle", "Adaptive Radiation", "Human evolution overview"]
    }
  },
  {
    unitNumber: 8,
    unitName: "Biology and Human Welfare",
    chapters: {
      "Human Health and Disease": ["Pathogens causing human diseases (Malaria, Filariasis, Ascariasis, Typhoid, Pneumonia, Amoebiasis, Ringworm)", "Basic immunology concepts", "Innate and Acquired immunity", "Vaccines", "Allergies", "Autoimmunity", "Immune system in body", "HIV and AIDS", "Cancer", "Drug and alcohol abuse"],
      "Strategies for Enhancement in Food Production": ["Animal husbandry", "Dairy farm management", "Poultry farm management", "Animal breeding", "Apiculture", "Fisheries", "Plant breeding", "Tissue culture", "Single cell protein", "Biofortification"],
      "Microbes in Human Welfare": ["Microbes in household products", "Industrial production", "Sewage treatment", "Production of biogas", "Microbes as biocontrol agents", "Biofertilizers"]
    }
  },
  {
    unitNumber: 9,
    unitName: "Biotechnology and Its Applications",
    chapters: {
      "Biotechnology Principles and Processes": ["Principles of biotechnology", "Genetic engineering (Recombinant DNA technology)", "Tools of RDT (Restriction enzymes, Ligases, Vectors)", "Processes of RDT", "PCR process", "Downstream processing"],
      "Biotechnology and Its Applications": ["Application in agriculture", "Bt crops", "RNA interference", "Application in medicine", "Genetically engineered insulin", "Gene therapy", "Molecular diagnosis", "Transgenic animals", "Biosafety issues", "Biopiracy and patents"]
    }
  },
  {
    unitNumber: 10,
    unitName: "Ecology and Environment",
    chapters: {
      "Organisms and Populations": ["Organism and its environment", "Abiotic factors", "Responses to abiotic factors", "Adaptations", "Population attributes", "Population growth (Exponential and Logistic)", "Life history variation", "Population interactions (Predation, Competition, Parasitism, Commensalism, Mutualism, Amensalism)"],
      "Ecosystem": ["Ecosystem components", "Productivity", "Decomposition", "Energy flow", "Ecological pyramids (Number, Biomass, Energy)", "Ecological succession", "Nutrient cycling (Carbon and Phosphorus)", "Ecosystem services"],
      "Biodiversity and Conservation": ["Concept of biodiversity", "Patterns of biodiversity", "Importance of biodiversity", "Loss of biodiversity", "Biodiversity conservation", "In-situ conservation (Hotspots, National parks, Sanctuaries, Biosphere reserves)", "Ex-situ conservation"],
      "Environmental Issues": ["Air pollution and its control", "Water pollution and its control", "Solid wastes", "Agro-chemicals and their effects", "Radioactive wastes", "Greenhouse effect and global warming", "Ozone depletion", "Deforestation", "Success stories of environmental conservation"]
    }
  }
];


const documents = [];

biologySyllabus.forEach(unit => {
  let topicCount = 0;
  Object.keys(unit.chapters).forEach(chapterName => {
    const topics = unit.chapters[chapterName];
    topics.forEach((topicStr, index) => {
      topicCount++;
      documents.push({
        exam: "NEET",
        subject: "Biology",
        unitNumber: unit.unitNumber,
        unitName: unit.unitName,
        chapterName: chapterName,
        topicName: topicStr,
        subtopic: topicStr,
        difficulty: topicCount % 3 === 0 ? "hard" : topicCount % 2 === 0 ? "medium" : "easy",
        weightage: 1,
        isCompleted: false,
        createdAt: new Date(),
        lastStudiedAt: null,
        revisionScore: 0
      });
    });
  });
});

console.log(`Prepared ${documents.length} NEET Biology topics.`);

async function seedDatabase() {
  const MONGO_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/prepgenius';
  try {
    await mongoose.connect(MONGO_URI);
    await NeetBiologySyllabus.deleteMany({});
    
    const result = await NeetBiologySyllabus.insertMany(documents);
    console.log(`✅ Successfully seeded ${result.length} topics into 'neet_biology_syllabus'.`);
  } catch (err) {
    console.error(`❌ Error during seeding:`, err);
  } finally {
    mongoose.connection.close();
  }
}

seedDatabase();
