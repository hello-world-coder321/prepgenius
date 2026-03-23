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
}, { collection: 'neet_physics_syllabus' });

const NeetPhysicsSyllabus = mongoose.models.NeetPhysicsSyllabus || mongoose.model('NeetPhysicsSyllabus', schema);

// NEET Physics is essentially identical to JEE Physics but explicitly structured for the NEET exam collection
const rawSyllabus = [
  {
    unitNumber: 1,
    unitName: "Physical World and Measurement",
    chapters: { "Measurements": ["SI Units", "Fundamental and derived units", "Dimensional analysis", "Applications of dimensional analysis", "Accuracy and precision", "Significant figures", "Types of errors", "Combination of errors", "Vernier callipers and Screw gauge"] }
  },
  {
    unitNumber: 2,
    unitName: "Kinematics",
    chapters: {
      "Straight Line": ["Position and displacement", "Distance", "Average speed", "Instantaneous velocity", "Average and instantaneous acceleration", "Kinematic equations", "Relative velocity 1D", "Motion under gravity"],
      "Motion in a Plane": ["Scalars and Vectors", "Vector addition and subtraction", "Resolution of vectors", "Dot and Cross product", "Projectile motion equations", "Time of flight and max height", "Horizontal range", "Uniform Circular Motion parameters", "Centripetal acceleration"]
    }
  },
  {
    unitNumber: 3,
    unitName: "Laws of Motion",
    chapters: { "Newton's Laws": ["Inertia", "Concept of Force", "Momentum", "Impulse", "F=ma applications", "Action and reaction", "Conservation of Linear Momentum", "Rockets", "Static friction", "Kinetic friction", "Rolling friction", "Angle of friction", "Banking of roads"] }
  },
  {
    unitNumber: 4,
    unitName: "Work Energy and Power",
    chapters: { "Work and Energy": ["Work done by constant force", "Work done by variable force", "Kinetic energy", "Potential energy", "Conservative vs Non-conservative forces", "Work-Energy Theorem", "Power", "Elastic collisions 1D and 2D", "Inelastic collisions", "Coefficient of restitution"] }
  },
  {
    unitNumber: 5,
    unitName: "Rotational Motion",
    chapters: { "Rigid Body Dynamics": ["Center of mass 2-particle", "Center of mass rigid bodies", "Torque", "Angular momentum", "Conservation of angular momentum", "Radius of gyration", "Parallel/perpendicular axis theorems", "M.I. standard objects", "Rotational kinematics", "Work and Energy rotational", "Rolling Motion"] }
  },
  {
    unitNumber: 6,
    unitName: "Gravitation",
    chapters: { "Gravitation Concept": ["Newton's Law of Gravitation", "Gravitational constant", "Variation of g (altitude, depth, latitude)", "Gravitational field", "Gravitational potential energy", "Kepler's laws", "Escape velocity", "Orbital velocity", "Geostationary satellites"] }
  },
  {
    unitNumber: 7,
    unitName: "Properties of Bulk Matter",
    chapters: {
      "Solids": ["Stress and strain", "Hooke's law", "Stress-strain curve", "Young's modulus", "Bulk modulus", "Shear modulus", "Poisson's ratio", "Elastic potential energy"],
      "Fluids": ["Pascal's law", "Archimedes principle", "Floatation", "Streamline/turbulent flow", "Equation of continuity", "Bernoulli's principle", "Stokes' law", "Terminal velocity", "Reynold's number", "Surface tension", "Surface energy", "Angle of contact", "Capillary rise"]
    }
  },
  {
    unitNumber: 8,
    unitName: "Thermodynamics",
    chapters: { "Thermal Physics": ["Zeroth law", "Temperature concept", "First law of thermodynamics", "Specific heat", "Cp and Cv", "Isothermal process", "Adiabatic process", "Isobaric/Isochoric", "Second Law", "Reversible/irreversible", "Heat engines", "Refrigerators", "Carnot cycle"] }
  },
  {
    unitNumber: 9,
    unitName: "Kinetic Theory of Gases",
    chapters: { "KTG": ["Ideal gas equation", "Assumptions of KTG", "Pressure concept in gas", "KTG Kinetic energy", "RMS speed", "Maxwell distribution", "Degrees of freedom", "Equipartition of energy", "Mean free path", "Avogadro's number"] }
  },
  {
    unitNumber: 10,
    unitName: "Oscillations and Waves",
    chapters: {
      "Oscillations": ["Period and frequency", "Displacement formula", "SHM Equation", "Phase", "Velocity/acceleration SHM", "Energy in SHM", "Spring oscillations", "Simple pendulum", "Free/forced/damped oscillations", "Resonance"],
      "Waves": ["Transverse/longitudinal waves", "Speed of wave", "Displacement relation progressive", "Superposition of waves", "Standing waves strings/pipes", "Beats", "Doppler Effect sound"]
    }
  },
  {
    unitNumber: 11,
    unitName: "Electrostatics",
    chapters: {
      "Charges": ["Conservation of charge", "Coulomb's law", "Superposition principle", "Electric field point charge", "Electric field lines", "Dipole field", "Torque on dipole", "Electric flux", "Gauss's theorem applications"],
      "Potential": ["Potential point charge", "Potential dipole", "Equipotential surfaces", "Potential energy systems", "Conductors/Insulators", "Dielectrics", "Capacitors series/parallel", "Parallel plate capacitor", "Energy stored capacitor"]
    }
  },
  {
    unitNumber: 12,
    unitName: "Current Electricity",
    chapters: { "Current": ["Electric current", "Drift velocity", "Mobility", "Ohm's Law", "V-I characteristics", "Electrical power", "Resistivity", "Temperature dependence", "Color code resistors", "Series/parallel resistors", "Cells EMF", "Internal resistance of cells", "Kirchhoff's Laws", "Wheatstone bridge", "Meter bridge", "Potentiometer"] }
  },
  {
    unitNumber: 13,
    unitName: "Magnetic Effects of Current",
    chapters: {
      "Moving Charges": ["Magnetic field concept", "Biot-Savart Law", "Ampere's Law applications", "Force on moving charge", "Lorentz force", "Cyclotron", "Force on current-carrying wire", "Force between parallel currents", "Torque on loop", "Moving coil galvanometer"],
      "Magnetism": ["Bar magnet equivalent solenoid", "Earth's magnetic field", "Para/dia/ferro materials", "Magnetic susceptibility", "Hysteresis", "Electromagnets"]
    }
  },
  {
    unitNumber: 14,
    unitName: "Electromagnetic Induction",
    chapters: { "EMI and AC": ["Magnetic flux", "Faraday's experiments", "Induced emf", "Lenz's Law", "Eddy currents", "Self and mutual inductance", "Peak and RMS AC", "Reactance/impedance", "LCR circuit", "Resonance AC", "Power factor", "Wattless current", "AC generator", "Transformers"] }
  },
  {
    unitNumber: 15,
    unitName: "Electromagnetic Waves",
    chapters: { "EM Waves": ["Displacement current", "Characteristics of EM waves", "Transverse nature", "Electromagnetic spectrum", "Radio waves", "Microwaves", "Infrared/Visible", "UV/X-rays/Gamma", "Uses of distinct waves"] }
  },
  {
    unitNumber: 16,
    unitName: "Optics",
    chapters: {
      "Ray Optics": ["Reflection mirrors", "Mirror formula", "TIR and optical fibers", "Refraction spherical surfaces", "Lens maker's formula", "Magnification and Power", "Combination thin lenses", "Prism refraction/dispersion", "Scattering", "Microscopes", "Telescopes", "Resolving power instruments"],
      "Wave Optics": ["Wavefront", "Huygens principle", "Interference", "Young's double slit", "Fringe width", "Diffraction single slit", "Width of central maximum", "Polarization", "Brewster's law", "Uses of polaroids"]
    }
  },
  {
    unitNumber: 17,
    unitName: "Dual Nature of Matter",
    chapters: { "Dual Nature": ["Photoelectric Effect", "Einstein's PE equation", "Particle nature of light", "Wave nature of particles", "de Broglie relation", "Davisson-Germer Experiment"] }
  },
  {
    unitNumber: 18,
    unitName: "Atoms and Nuclei",
    chapters: {
      "Atoms": ["Rutherford model", "Bohr model", "Energy levels", "Hydrogen spectrum series"],
      "Nuclei": ["Isotopes/isobars/isotones", "Size of nucleus", "Mass defect", "Binding energy variation", "Radioactivity alpha/beta/gamma", "Decay law", "Half-life", "Mean life", "Nuclear fission", "Nuclear fusion"]
    }
  },
  {
    unitNumber: 19,
    unitName: "Electronic Devices",
    chapters: { "Semiconductors": ["Energy bands solids", "Intrinsic/extrinsic semiconductors", "p-n junction formation", "Forward/reverse bias", "Diode as rectifier", "Zener diode regulator", "Transistor action", "CE configuration characteristics", "Transistor as amplifier", "Logic gates AND/OR/NOT/NAND/NOR"] }
  },
  {
    unitNumber: 20,
    unitName: "Experimental Skills",
    chapters: { "Experiments": ["Vernier callipers", "Screw gauge", "Simple pendulum", "Meter scale moments", "Young's Modulus wire", "Surface Tension capillary", "Coefficient of Viscosity measurement", "Speed of Sound resonance", "Specific Heat mixture", "Ohm's Law verification", "Resistance Meter bridge", "Potentiometer EMF", "Galvanometer merit", "Focal Length mirrors", "Focal Length lenses", "Prism angles", "Refractive Index microscope", "p-n junction curves", "Zener diode characteristics", "Transistor CE curves"] }
  }
];

const documents = [];

rawSyllabus.forEach(unit => {
  Object.keys(unit.chapters).forEach(chapterName => {
    const topics = unit.chapters[chapterName];
    topics.forEach((topicStr, index) => {
      documents.push({
        exam: "NEET",
        subject: "Physics",
        unitNumber: unit.unitNumber,
        unitName: unit.unitName,
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

console.log(`Prepared ${documents.length} NEET Physics topics.`);

async function seedDatabase() {
  const MONGO_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/prepgenius';
  try {
    await mongoose.connect(MONGO_URI);
    await NeetPhysicsSyllabus.deleteMany({});
    const result = await NeetPhysicsSyllabus.insertMany(documents);
    console.log(`✅ Successfully seeded ${result.length} topics into 'neet_physics_syllabus'.`);
  } catch (err) {
    console.error(`❌ Error during seeding:`, err);
  } finally {
    mongoose.connection.close();
  }
}

seedDatabase();
