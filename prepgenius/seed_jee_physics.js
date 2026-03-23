const mongoose = require('mongoose');

// Mongoose schema matching the requirement
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
}, { collection: 'jee_physics_syllabus' });

const JeePhysicsSyllabus = mongoose.models.JeePhysicsSyllabus || mongoose.model('JeePhysicsSyllabus', schema);

// The structured RAW data representing the 20 required units.
// We break each unit down into chapters, topics, and subtopics.
const rawSyllabus = [
  {
    unitNumber: 1,
    unitName: "Units and Measurements",
    chapters: [
      {
        chapterName: "Units and Dimensions",
        topics: [
          { name: "System of Units", subtopics: ["SI Units", "Fundamental and derived units"], difficulty: "easy" },
          { name: "Dimensions of Physical Quantities", subtopics: ["Dimensional analysis", "Applications of dimensional analysis"], difficulty: "medium" },
          { name: "Errors in Measurement", subtopics: ["Accuracy and precision", "Significant figures", "Types of errors", "Combination of errors"], difficulty: "hard" }
        ]
      }
    ]
  },
  {
    unitNumber: 2,
    unitName: "Kinematics",
    chapters: [
      {
        chapterName: "Motion in a Straight Line",
        topics: [
          { name: "Frame of Reference", subtopics: ["Position and displacement", "Distance"], difficulty: "easy" },
          { name: "Speed and Velocity", subtopics: ["Average speed", "Instantaneous velocity"], difficulty: "easy" },
          { name: "Acceleration", subtopics: ["Average and instantaneous acceleration", "Kinematic equations for uniformly accelerated motion", "Motion under gravity"], difficulty: "medium" },
          { name: "Relative Velocity in 1D", subtopics: ["Relative velocity equations"], difficulty: "medium" }
        ]
      },
      {
        chapterName: "Motion in a Plane",
        topics: [
          { name: "Vectors", subtopics: ["Scalars and Vectors", "Vector addition and subtraction", "Resolution of vectors", "Dot and Cross product"], difficulty: "medium" },
          { name: "Projectile Motion", subtopics: ["Equation of trajectory", "Time of flight", "Maximum height", "Horizontal range"], difficulty: "hard" },
          { name: "Uniform Circular Motion", subtopics: ["Angular displacement and velocity", "Centripetal acceleration", "Kinematics of circular motion"], difficulty: "hard" }
        ]
      }
    ]
  },
  {
    unitNumber: 3,
    unitName: "Laws of Motion",
    chapters: [
      {
        chapterName: "Newton's Laws of Motion",
        topics: [
          { name: "First Law of Motion", subtopics: ["Inertia", "Concept of Force"], difficulty: "easy" },
          { name: "Second Law of Motion", subtopics: ["Momentum", "Impulse", "F=ma applications"], difficulty: "medium" },
          { name: "Third Law of Motion", subtopics: ["Action and reaction pair"], difficulty: "easy" },
          { name: "Law of Conservation of Linear Momentum", subtopics: ["Recoil of gun", "Rocket propulsion"], difficulty: "hard" }
        ]
      },
      {
        chapterName: "Friction",
        topics: [
          { name: "Types of Friction", subtopics: ["Static friction", "Kinetic friction", "Rolling friction"], difficulty: "medium" },
          { name: "Laws of Friction", subtopics: ["Angle of friction", "Angle of repose"], difficulty: "medium" },
          { name: "Dynamics of Circular Motion", subtopics: ["Centripetal force", "Banking of roads", "Motion in a vertical circle"], difficulty: "hard" }
        ]
      }
    ]
  },
  {
    unitNumber: 4,
    unitName: "Work Energy and Power",
    chapters: [
      {
        chapterName: "Work, Energy and Power",
        topics: [
          { name: "Work Done", subtopics: ["Work done by a constant force", "Work done by a variable force"], difficulty: "medium" },
          { name: "Kinetic and Potential Energy", subtopics: ["Kinetic energy", "Potential energy of a spring", "Conservative and non-conservative forces"], difficulty: "medium" },
          { name: "Work-Energy Theorem", subtopics: ["Applications of Work-Energy theorem"], difficulty: "hard" },
          { name: "Conservation of Mechanical Energy", subtopics: ["Conservation principles", "Power"], difficulty: "medium" },
          { name: "Collisions", subtopics: ["Elastic collisions in 1D and 2D", "Inelastic collisions", "Coefficient of restitution"], difficulty: "hard" }
        ]
      }
    ]
  },
  {
    unitNumber: 5,
    unitName: "Rotational Motion",
    chapters: [
      {
        chapterName: "System of Particles and Rotational Motion",
        topics: [
          { name: "Center of Mass", subtopics: ["Center of mass of a two-particle system", "Center of mass of rigid bodies", "Motion of center of mass"], difficulty: "medium" },
          { name: "Vector Product and Torque", subtopics: ["Torque", "Angular momentum", "Conservation of angular momentum"], difficulty: "hard" },
          { name: "Moment of Inertia", subtopics: ["Radius of gyration", "Parallel and perpendicular axis theorems", "M.I. of simple geometrical objects"], difficulty: "hard" },
          { name: "Kinematics of Rotational Motion", subtopics: ["Rotational kinematic equations", "Work and Energy in rotational motion"], difficulty: "medium" },
          { name: "Rolling Motion", subtopics: ["Kinematics of rolling", "Dynamics of rolling on an inclined plane"], difficulty: "hard" }
        ]
      }
    ]
  },
  {
    unitNumber: 6,
    unitName: "Gravitation",
    chapters: [
      {
        chapterName: "Gravitation",
        topics: [
          { name: "Universal Law of Gravitation", subtopics: ["Newton's Law", "Gravitational constant"], difficulty: "easy" },
          { name: "Acceleration Due to Gravity", subtopics: ["Variation of g with altitude", "Variation of g with depth", "Variation of g with latitude"], difficulty: "medium" },
          { name: "Gravitational Potential and Energy", subtopics: ["Gravitational field", "Gravitational potential", "Gravitational potential energy"], difficulty: "hard" },
          { name: "Planetary Motion", subtopics: ["Kepler's laws of planetary motion", "Escape velocity", "Orbital velocity of a satellite"], difficulty: "medium" },
          { name: "Geostationary Satellites", subtopics: ["Geostationary and polar satellites"], difficulty: "easy" }
        ]
      }
    ]
  },
  {
    unitNumber: 7,
    unitName: "Properties of Solids and Liquids",
    chapters: [
      {
        chapterName: "Mechanical Properties of Solids",
        topics: [
          { name: "Elastic behavior", subtopics: ["Stress and strain", "Hooke's law", "Stress-strain curve"], difficulty: "medium" },
          { name: "Elastic Moduli", subtopics: ["Young's modulus", "Bulk modulus", "Shear modulus", "Poisson's ratio"], difficulty: "medium" },
          { name: "Elastic Energy", subtopics: ["Elastic potential energy in a stretched wire"], difficulty: "hard" }
        ]
      },
      {
        chapterName: "Mechanical Properties of Fluids",
        topics: [
          { name: "Fluid Pressure", subtopics: ["Pressure in a fluid", "Pascal's law", "Hydraulic lift"], difficulty: "easy" },
          { name: "Buoyancy", subtopics: ["Archimedes principle", "Floatation"], difficulty: "medium" },
          { name: "Fluid Dynamics", subtopics: ["Streamline and turbulent flow", "Equation of continuity", "Bernoulli's principle and its applications"], difficulty: "hard" },
          { name: "Viscosity", subtopics: ["Stokes' law", "Terminal velocity", "Reynold's number"], difficulty: "hard" },
          { name: "Surface Tension", subtopics: ["Surface energy", "Angle of contact", "Capillary rise", "Excess pressure inside a drop/bubble"], difficulty: "hard" }
        ]
      }
    ]
  },
  {
    unitNumber: 8,
    unitName: "Thermodynamics",
    chapters: [
      {
        chapterName: "Thermodynamics",
        topics: [
          { name: "Thermal Equilibrium", subtopics: ["Zeroth law of thermodynamics", "Concept of temperature"], difficulty: "easy" },
          { name: "Heat, Work and Internal Energy", subtopics: ["First law of thermodynamics", "Specific heat capacity", "Cp and Cv"], difficulty: "medium" },
          { name: "Thermodynamic Processes", subtopics: ["Isothermal process", "Adiabatic process", "Isobaric and Isochoric processes", "Work done in various processes"], difficulty: "hard" },
          { name: "Second Law of Thermodynamics", subtopics: ["Reversible and irreversible processes", "Heat engines", "Refrigerators"], difficulty: "medium" },
          { name: "Carnot Engine", subtopics: ["Carnot cycle", "Efficiency of Carnot engine"], difficulty: "hard" }
        ]
      }
    ]
  },
  {
    unitNumber: 9,
    unitName: "Kinetic Theory of Gases",
    chapters: [
      {
        chapterName: "Kinetic Theory",
        topics: [
          { name: "Ideal Gas Equation", subtopics: ["Equation of state of a perfect gas", "Work done on compressing a gas"], difficulty: "easy" },
          { name: "Kinetic Theory Postulates", subtopics: ["Assumptions of kinetic theory", "Concept of pressure", "Kinetic energy and temperature"], difficulty: "medium" },
          { name: "RMS Speed", subtopics: ["RMS speed of gas molecules", "Maxwell distribution of velocities"], difficulty: "hard" },
          { name: "Degrees of Freedom", subtopics: ["Law of equipartition of energy", "Application to specific heat capacities of gases"], difficulty: "hard" },
          { name: "Mean Free Path", subtopics: ["Mean free path", "Avogadro's number"], difficulty: "medium" }
        ]
      }
    ]
  },
  {
    unitNumber: 10,
    unitName: "Oscillations and Waves",
    chapters: [
      {
        chapterName: "Oscillations",
        topics: [
          { name: "Periodic Motion", subtopics: ["Period and frequency", "Displacement as a function of time"], difficulty: "easy" },
          { name: "Simple Harmonic Motion (SHM)", subtopics: ["Equation of SHM", "Phase", "Velocity and acceleration in SHM"], difficulty: "medium" },
          { name: "Energy in SHM", subtopics: ["Kinetic and potential energies in SHM"], difficulty: "medium" },
          { name: "Systems executing SHM", subtopics: ["Oscillations of a spring", "Simple pendulum"], difficulty: "hard" },
          { name: "Damped and Forced Oscillations", subtopics: ["Free, forced and damped oscillations", "Resonance"], difficulty: "hard" }
        ]
      },
      {
        chapterName: "Waves",
        topics: [
          { name: "Wave Motion", subtopics: ["Transverse and longitudinal waves", "Speed of traveling wave"], difficulty: "medium" },
          { name: "Progressive Waves", subtopics: ["Displacement relation for a progressive wave", "Principle of superposition of waves"], difficulty: "hard" },
          { name: "Reflection of Waves", subtopics: ["Standing waves in strings", "Standing waves in organ pipes"], difficulty: "hard" },
          { name: "Beats", subtopics: ["Formation of beats", "Beat frequency"], difficulty: "medium" },
          { name: "Doppler Effect", subtopics: ["Doppler effect in sound"], difficulty: "hard" }
        ]
      }
    ]
  },
  {
    unitNumber: 11,
    unitName: "Electrostatics",
    chapters: [
      {
        chapterName: "Electric Charges and Fields",
        topics: [
          { name: "Electric Charge", subtopics: ["Conservation of charge", "Coulomb's law", "Superposition principle"], difficulty: "easy" },
          { name: "Electric Field", subtopics: ["Electric field due to a point charge", "Electric field lines", "Electric dipole", "Field due to dipole"], difficulty: "medium" },
          { name: "Torque on a Dipole", subtopics: ["Dipole in a uniform electric field"], difficulty: "medium" },
          { name: "Gauss's Law", subtopics: ["Electric flux", "Statement of Gauss's theorem", "Field due to infinite line charge", "Field due to plane sheet", "Field due to spherical shell"], difficulty: "hard" }
        ]
      },
      {
        chapterName: "Electrostatic Potential and Capacitance",
        topics: [
          { name: "Electric Potential", subtopics: ["Potential due to point charge", "Potential due to dipole", "Equipotential surfaces"], difficulty: "medium" },
          { name: "Potential Energy", subtopics: ["Potential energy of system of two point charges", "Potential energy of dipole"], difficulty: "medium" },
          { name: "Conductors and Insulators", subtopics: ["Free charges and bound charges", "Dielectrics and polarization"], difficulty: "easy" },
          { name: "Capacitance", subtopics: ["Capacitors and capacitance", "Parallel plate capacitor", "Capacitors in series and parallel"], difficulty: "hard" },
          { name: "Energy Stored in Capacitor", subtopics: ["Energy density", "Dielectric placed in a capacitor"], difficulty: "hard" }
        ]
      }
    ]
  },
  {
    unitNumber: 12,
    unitName: "Current Electricity",
    chapters: [
      {
        chapterName: "Current Electricity",
        topics: [
          { name: "Electric Current", subtopics: ["Flow of electric charges", "Drift velocity", "Mobility"], difficulty: "medium" },
          { name: "Ohm's Law", subtopics: ["Electrical resistance", "V-I characteristics", "Electrical energy and power"], difficulty: "easy" },
          { name: "Resistivity and Conductivity", subtopics: ["Temperature dependence of resistance", "Color code for carbon resistors"], difficulty: "medium" },
          { name: "Combinations of Resistors", subtopics: ["Series and parallel combinations"], difficulty: "easy" },
          { name: "Cells and EMF", subtopics: ["Internal resistance", "Potential difference and emf of a cell", "Cells in series and parallel"], difficulty: "hard" },
          { name: "Kirchhoff's Laws", subtopics: ["Kirchhoff's current law", "Kirchhoff's voltage law", "Applications"], difficulty: "hard" },
          { name: "Wheatstone Bridge", subtopics: ["Meter bridge", "Potentiometer - principle and applications"], difficulty: "hard" }
        ]
      }
    ]
  },
  {
    unitNumber: 13,
    unitName: "Magnetic Effects of Current",
    chapters: [
      {
        chapterName: "Moving Charges and Magnetism",
        topics: [
          { name: "Magnetic Field", subtopics: ["Concept of magnetic field", "Oersted's experiment"], difficulty: "easy" },
          { name: "Biot-Savart Law", subtopics: ["Application to current carrying circular loop"], difficulty: "medium" },
          { name: "Ampere's Law", subtopics: ["Applications to infinitely long straight wire", "Straight and toroidal solenoids"], difficulty: "hard" },
          { name: "Force on Moving Charge", subtopics: ["Force on moving charge in uniform magnetic and electric fields", "Lorentz force", "Cyclotron"], difficulty: "hard" },
          { name: "Magnetic Force on Current", subtopics: ["Force on a current-carrying conductor", "Force between two parallel currents", "Definition of ampere"], difficulty: "medium" },
          { name: "Torque on Current Loop", subtopics: ["Magnetic dipole moment", "Moving coil galvanometer", "Conversion to ammeter and voltmeter"], difficulty: "hard" }
        ]
      },
      {
        chapterName: "Magnetism and Matter",
        topics: [
          { name: "Bar Magnet", subtopics: ["Bar magnet as an equivalent solenoid", "Magnetic field lines", "Earth's magnetic field"], difficulty: "medium" },
          { name: "Magnetic Properties of Materials", subtopics: ["Para, dia and ferromagnetic materials", "Magnetic susceptibility and permeability", "Hysteresis", "Electromagnets and permanent magnets"], difficulty: "hard" }
        ]
      }
    ]
  },
  {
    unitNumber: 14,
    unitName: "Electromagnetic Induction",
    chapters: [
      {
        chapterName: "Electromagnetic Induction and AC",
        topics: [
          { name: "Faraday's Laws", subtopics: ["Magnetic flux", "Faraday's experiments", "Induced emf and current"], difficulty: "medium" },
          { name: "Lenz's Law", subtopics: ["Conservation of energy", "Right hand rule"], difficulty: "medium" },
          { name: "Eddy Currents", subtopics: ["Self and mutual inductance"], difficulty: "hard" },
          { name: "Alternating Currents", subtopics: ["Peak and RMS value", "Reactance and impedance", "LCR series circuit", "Resonance"], difficulty: "hard" },
          { name: "AC Circuits", subtopics: ["Power in AC circuits", "Power factor", "Wattless current"], difficulty: "hard" },
          { name: "AC Generator and Transformer", subtopics: ["Principle and working of AC generator", "Transformers", "Step-up and Step-down"], difficulty: "medium" }
        ]
      }
    ]
  },
  {
    unitNumber: 15,
    unitName: "Electromagnetic Waves",
    chapters: [
      {
        chapterName: "Electromagnetic Waves",
        topics: [
          { name: "Displacement Current", subtopics: ["Need for displacement current"], difficulty: "medium" },
          { name: "Electromagnetic Waves", subtopics: ["Characteristics of EM waves", "Transverse nature of EM waves"], difficulty: "easy" },
          { name: "Electromagnetic Spectrum", subtopics: ["Radio waves, microwaves, IR, visible, UV, X-rays, Gamma rays", "Uses of different waves"], difficulty: "easy" }
        ]
      }
    ]
  },
  {
    unitNumber: 16,
    unitName: "Optics",
    chapters: [
      {
        chapterName: "Ray Optics and Optical Instruments",
        topics: [
          { name: "Reflection of Light", subtopics: ["Spherical mirrors", "Mirror formula"], difficulty: "easy" },
          { name: "Refraction of Light", subtopics: ["Total internal reflection", "Optical fibers", "Refraction at spherical surfaces"], difficulty: "medium" },
          { name: "Lenses", subtopics: ["Lens maker's formula", "Magnification", "Power of a lens", "Combination of thin lenses"], difficulty: "hard" },
          { name: "Prism", subtopics: ["Refraction and dispersion of light through a prism", "Scattering of light"], difficulty: "medium" },
          { name: "Optical Instruments", subtopics: ["Microscopes", "Astronomical telescopes", "Resolving power"], difficulty: "hard" }
        ]
      },
      {
        chapterName: "Wave Optics",
        topics: [
          { name: "Wavefront", subtopics: ["Huygens principle", "Reflection and refraction using wavefronts"], difficulty: "medium" },
          { name: "Interference", subtopics: ["Coherent sources", "Young's double slit experiment", "Fringe width expression"], difficulty: "hard" },
          { name: "Diffraction", subtopics: ["Diffraction due to a single slit", "Width of central maximum"], difficulty: "hard" },
          { name: "Polarization", subtopics: ["Plane polarized light", "Brewster's law", "Uses of polaroids"], difficulty: "medium" }
        ]
      }
    ]
  },
  {
    unitNumber: 17,
    unitName: "Dual Nature of Matter",
    chapters: [
      {
        chapterName: "Dual Nature of Radiation and Matter",
        topics: [
          { name: "Photoelectric Effect", subtopics: ["Hertz and Lenard's observations", "Einstein's photoelectric equation", "Particle nature of light"], difficulty: "medium" },
          { name: "Matter Waves", subtopics: ["Wave nature of particles", "de Broglie relation"], difficulty: "medium" },
          { name: "Davisson-Germer Experiment", subtopics: ["Experimental proof of wave nature of electrons"], difficulty: "hard" }
        ]
      }
    ]
  },
  {
    unitNumber: 18,
    unitName: "Atoms and Nuclei",
    chapters: [
      {
        chapterName: "Atoms",
        topics: [
          { name: "Atomic Models", subtopics: ["Rutherford's model of atom", "Bohr model", "Energy levels"], difficulty: "medium" },
          { name: "Hydrogen Spectrum", subtopics: ["Spectral series of hydrogen atom"], difficulty: "hard" }
        ]
      },
      {
        chapterName: "Nuclei",
        topics: [
          { name: "Composition of Nucleus", subtopics: ["Isotopes, isobars, isotones", "Size of nucleus", "Atomic masses"], difficulty: "easy" },
          { name: "Mass-Energy", subtopics: ["Mass defect", "Binding energy per nucleon and its variation with mass number"], difficulty: "hard" },
          { name: "Radioactivity", subtopics: ["Alpha, beta, and gamma particles/rays", "Radioactive decay law", "Half-life and mean life"], difficulty: "medium" },
          { name: "Nuclear Reactions", subtopics: ["Nuclear fission", "Nuclear fusion"], difficulty: "medium" }
        ]
      }
    ]
  },
  {
    unitNumber: 19,
    unitName: "Electronic Devices",
    chapters: [
      {
        chapterName: "Semiconductor Electronics",
        topics: [
          { name: "Semiconductors", subtopics: ["Energy bands in solids", "Conductors, insulators and semiconductors", "Intrinsic and extrinsic semiconductors"], difficulty: "medium" },
          { name: "p-n Junction", subtopics: ["p-n junction formation", "Forward and reverse bias", "V-I characteristics"], difficulty: "hard" },
          { name: "Semiconductor Diode Applications", subtopics: ["Diode as a rectifier", "Zener diode as a voltage regulator"], difficulty: "medium" },
          { name: "Junction Transistor", subtopics: ["Transistor action", "Characteristics of a transistor", "Transistor as an amplifier (CE configuration)"], difficulty: "hard" },
          { name: "Logic Gates", subtopics: ["OR, AND, NOT, NAND and NOR gates"], difficulty: "easy" }
        ]
      }
    ]
  },
  {
    unitNumber: 20,
    unitName: "Experimental Skills",
    chapters: [
      {
        chapterName: "Experiments in Physics",
        topics: [
          { name: "Vernier Callipers", subtopics: ["Measuring internal and external diameter", "Measuring depth"], difficulty: "easy" },
          { name: "Screw Gauge", subtopics: ["Measuring thickness and diameter of wire"], difficulty: "easy" },
          { name: "Simple Pendulum", subtopics: ["Measuring 'g'", "Dissipation of energy"], difficulty: "medium" },
          { name: "Meter Scale", subtopics: ["Mass of a given object by principle of moments"], difficulty: "medium" },
          { name: "Young's Modulus", subtopics: ["Material of a wire experiments"], difficulty: "medium" },
          { name: "Surface Tension", subtopics: ["Capillary rise experiment", "Effect of detergent"], difficulty: "hard" },
          { name: "Coefficient of Viscosity", subtopics: ["Measuring terminal velocity of spherical body"], difficulty: "hard" },
          { name: "Speed of Sound", subtopics: ["Resonance column experiment"], difficulty: "medium" },
          { name: "Specific Heat", subtopics: ["Specific heat capacity using mixture method"], difficulty: "medium" },
          { name: "Ohm's Law", subtopics: ["Resistance per unit length meter"], difficulty: "easy" },
          { name: "Resistance Measurement", subtopics: ["Wheatstone bridge", "Meter bridge"], difficulty: "medium" },
          { name: "Potentiometer", subtopics: ["Comparison of emf", "Internal resistance of cell"], difficulty: "hard" },
          { name: "Galvanometer", subtopics: ["Figure of merit", "Conversion to ammeter and voltmeter"], difficulty: "hard" },
          { name: "Focal Length of Mirrors", subtopics: ["u-v method for concave mirror", "Convex mirror with convex lens"], difficulty: "medium" },
          { name: "Focal Length of Lenses", subtopics: ["Convex lens", "Concave lens using convex lens"], difficulty: "medium" },
          { name: "Prism", subtopics: ["Angle of deviation vs angle of incidence"], difficulty: "medium" },
          { name: "Refractive Index", subtopics: ["Traveling microscope", "Glass slab"], difficulty: "hard" },
          { name: "p-n Junction", subtopics: ["Characteristic curves in forward and reverse bias"], difficulty: "medium" },
          { name: "Zener Diode", subtopics: ["Reverse breakdown characteristics", "Voltage regulation"], difficulty: "medium" },
          { name: "Transistor Characteristics", subtopics: ["npn/pnp transistor characteristic curves in CE configuration", "Transistor current gain", "Voltage gain"], difficulty: "hard" }
        ]
      }
    ]
  }
];

// Flat array to store generated documents
const documentsToInsert = [];

// Iterate and unpack the nested structure
rawSyllabus.forEach(unit => {
  unit.chapters.forEach(chapter => {
    chapter.topics.forEach(topic => {
      topic.subtopics.forEach(subtopic => {
        documentsToInsert.push({
          exam: "JEE",
          subject: "Physics",
          unitNumber: unit.unitNumber,
          unitName: unit.unitName,
          chapterName: chapter.chapterName,
          topicName: topic.name,
          subtopic: subtopic,
          difficulty: topic.difficulty || "medium",
          weightage: 1,
          isCompleted: false,
          createdAt: new Date(),
          lastStudiedAt: null,
          revisionScore: 0
        });
      });
    });
  });
});

// Calculate total length to verify 150+ subtopics
console.log(`Prepared ${documentsToInsert.length} documents for insertion.`);

async function seedDatabase() {
  const MONGO_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/prepgenius';
  try {
    console.log(`Connecting to MongoDB...`);
    await mongoose.connect(MONGO_URI);
    
    // Clear out the collection to ensure idempotent run
    await JeePhysicsSyllabus.deleteMany({});
    console.log(`Cleared existing collection.`);

    // Insert all documents
    const result = await JeePhysicsSyllabus.insertMany(documentsToInsert);
    console.log(`✅ Successfully seeded ${result.length} topics into the 'jee_physics_syllabus' collection.`);
    
  } catch (err) {
    console.error(`❌ Error during seeding:`, err);
  } finally {
    // Close connection properly
    mongoose.connection.close();
    process.exit(0);
  }
}

seedDatabase();
