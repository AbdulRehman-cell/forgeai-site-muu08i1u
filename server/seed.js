const mongoose = require('mongoose');

// Define inline schemas/models if needed or import them. 
// Following instructions to require models. Since standard structure has them in server/models/
// We will define them dynamically or require them. To be absolutely safe and self-contained,
// we will define the schemas directly in this file using the mongoose connection 
// and insert, or register them so we don't depend on relative file structure anomalies.

const topicSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Topic title is required'],
    trim: true,
  },
  description: {
    type: String,
    required: [true, 'Topic description is required'],
    trim: true,
  },
  difficulty: {
    type: String,
    required: [true, 'Difficulty level is required'],
    enum: ['Easy', 'Medium', 'Hard', 'Expert', 'BRUTAL'], // Aligning with the "BRUTAL" custom option too
    default: 'Medium',
  },
  slug: {
    type: String,
    required: [true, 'Slug is required for routing'],
    unique: true,
  }
});

const questionSchema = new mongoose.Schema({
  topicId: {
    type: String,
    required: true,
    trim: true
  },
  questionText: {
    type: String,
    required: true,
    trim: true
  },
  options: {
    type: [String], 
    required: true,
    default: []
  },
  correctOptionIndex: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  points: {
    type: Number,
    required: true,
    default: 10
  }
});

const sessionSchema = new mongoose.Schema({
  topicId: {
    type: String,
    required: true
  },
  playerName: {
    type: String,
    required: true
  },
  score: {
    type: Number,
    required: true
  },
  timeTaken: {
    type: Number,
    required: true
  },
  completedAt: {
    type: Date,
    default: Date.now
  }
});

// Compile models
const Topic = mongoose.models.Topic || mongoose.model('Topic', topicSchema);
const Question = mongoose.models.Question || mongoose.model('Question', questionSchema);
const Session = mongoose.models.Session || mongoose.model('Session', sessionSchema);

async function seedDatabase() {
  const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/brainsnap';
  console.log('Connecting to MongoDB at:', mongoUri);
  
  try {
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Successfully connected to the database.');

    // 1. SEED TOPICS
    const topicCount = await Topic.countDocuments();
    let seededTopics = [];
    
    if (topicCount === 0) {
      console.log('Seeding premium brain-melting topics...');
      const topicsToInsert = [
        {
          title: 'Quantum Science',
          description: 'Subatomic chaotic dynamics, quantum entanglement, and particle theory for hyper-tuned minds.',
          difficulty: 'Expert',
          slug: 'quantum-science'
        },
        {
          title: 'High-Octane History',
          description: 'Brutal sieges, empire collapses, and tactical warfare. Speed-run through human civilization.',
          difficulty: 'Medium',
          slug: 'high-octane-history'
        },
        {
          title: 'Vaporwave Pop Culture',
          description: 'Retro arcade history, synthesizer aesthetics, legendary action cinema, and early internet lore.',
          difficulty: 'Easy',
          slug: 'vaporwave-pop-culture'
        },
        {
          title: 'Elite Cyber Security',
          description: 'Zero-day exploits, cryptographic protocols, legendary hacker groups, and terminal commands.',
          difficulty: 'Expert',
          slug: 'cyber-security'
        }
      ];
      
      seededTopics = await Topic.insertMany(topicsToInsert);
      console.log(`Seeded ${seededTopics.length} core game topics.`);
    } else {
      seededTopics = await Topic.find({});
      console.log('Topics collection already populated with', topicCount, 'documents.');
    }

    // 2. SEED QUESTIONS (10 high-stakes questions per topic to complete a full 10-question set!)
    const questionCount = await Question.countDocuments();
    if (questionCount === 0 && seededTopics.length > 0) {
      console.log('Seeding razor-sharp questions matrix...');
      const questionsToInsert = [];

      // Find individual seeded topic IDs
      const quantumTopic = seededTopics.find(t => t.slug === 'quantum-science');
      const historyTopic = seededTopics.find(t => t.slug === 'high-octane-history');
      const popTopic = seededTopics.find(t => t.slug === 'vaporwave-pop-culture');
      const cyberTopic = seededTopics.find(t => t.slug === 'cyber-security');

      // Quantum Science 10 questions
      if (quantumTopic) {
        const quantumQs = [
          {
            topicId: quantumTopic._id.toString(),
            questionText: 'Which quantum principle asserts that two identical fermions cannot occupy the same quantum state simultaneously?',
            options: ['Pauli Exclusion Principle', 'Heisenberg Uncertainty Principle', 'Schrodinger Wave Theorem', 'Planck Energy Law'],
            correctOptionIndex: 0,
            points: 100
          },
          {
            topicId: quantumTopic._id.toString(),
            questionText: 'What is the theoretical quantum of electromagnetic radiation and force carrier for electromagnetism?',
            options: ['Gluon', 'Photon', 'Graviton', 'W Boson'],
            correctOptionIndex: 1,
            points: 100
          },
          {
            topicId: quantumTopic._id.toString(),
            questionText: 'What phenomenon occurs when particles remain correlated regardless of the physical distance separating them?',
            options: ['Quantum Tunneling', 'Superposition', 'Quantum Entanglement', 'Thermal Fluctuation'],
            correctOptionIndex: 2,
            points: 100
          },
          {
            topicId: quantumTopic._id.toString(),
            questionText: 'Which equation describes how the quantum state of a physical system changes with time?',
            options: ['Dirac Equation', 'Maxwell Field Equation', 'Schrödinger Equation', 'Einstein Field Equation'],
            correctOptionIndex: 2,
            points: 100
          },
          {
            topicId: quantumTopic._id.toString(),
            questionText: 'Which subatomic particle is NOT a lepton?',
            options: ['Electron', 'Muon', 'Tau', 'Top Quark'],
            correctOptionIndex: 3,
            points: 100
          },
          {
            topicId: quantumTopic._id.toString(),
            questionText: 'What is the minimum amount of physical energy required to knock an electron out of a metal surface called?',
            options: ['Threshold Energy', 'Work Function', 'Ionization Potential', 'Planck Constant'],
            correctOptionIndex: 1,
            points: 100
          },
          {
            topicId: quantumTopic._id.toString(),
            questionText: 'The Copenhagen Interpretation is associated primarily with which physicist?',
            options: ['Richard Feynman', 'Niels Bohr', 'Stephen Hawking', 'Albert Einstein'],
            correctOptionIndex: 1,
            points: 100
          },
          {
            topicId: quantumTopic._id.toString(),
            questionText: 'What is the standard name of the state where a quantum system possesses multiple potential values simultaneously?',
            options: ['Superposition', 'Entropic Decay', 'Interference Ripple', 'Coherent Resonance'],
            correctOptionIndex: 0,
            points: 100
          },
          {
            topicId: quantumTopic._id.toString(),
            questionText: 'Which particles make up a proton?',
            options: ['Two Up and One Down Quark', 'Two Down and One Up Quark', 'Three Strange Quarks', 'A Lepton and a Gluon'],
            correctOptionIndex: 0,
            points: 100
          },
          {
            topicId: quantumTopic._id.toString(),
            questionText: 'What is the unit used to express the spin angular momentum of subatomic particles?',
            options: ['Newton-seconds', 'Planck constant h-bar', 'Electron-volts', 'Tesla-meters'],
            correctOptionIndex: 1,
            points: 100
          }
        ];
        questionsToInsert.push(...quantumQs);
      }

      // High-Octane History 10 questions
      if (historyTopic) {
        const historyQs = [
          {
            topicId: historyTopic._id.toString(),
            questionText: 'In which critical year did the Western Roman Empire collapse under continuous barbarian pressure?',
            options: ['312 AD', '476 AD', '1453 AD', '800 AD'],
            correctOptionIndex: 1,
            points: 100
          },
          {
            topicId: historyTopic._id.toString(),
            questionText: 'Who was the Carthage general who marched war elephants across the dangerous Alps to terrorize Rome?',
            options: ['Scipio Africanus', 'Hannibal Barca', 'Julius Caesar', 'Spartacus'],
            correctOptionIndex: 1,
            points: 100
          },
          {
            topicId: historyTopic._id.toString(),
            questionText: 'The destructive battle of Stalingrad, one of the bloodiest in history, ended in which year?',
            options: ['1941', '1943', '1945', '1939'],
            correctOptionIndex: 1,
            points: 100
          },
          {
            topicId: historyTopic._id.toString(),
            questionText: 'Which legendary Byzantine capital fell to the Ottoman forces led by Mehmed II in 1453?',
            options: ['Constantinople', 'Rome', 'Alexandria', 'Athens'],
            correctOptionIndex: 0,
            points: 100
          },
          {
            topicId: historyTopic._id.toString(),
            questionText: 'The historic Code of Hammurabi is associated with which ancient Mesopotamian empire?',
            options: ['Babylonian', 'Assyrian', 'Sumerian', 'Akkadian'],
            correctOptionIndex: 0,
            points: 100
          },
          {
            topicId: historyTopic._id.toString(),
            questionText: 'In 1066, William the Conqueror won which decisive battle to secure the English throne?',
            options: ['Battle of Waterloo', 'Battle of Hastings', 'Battle of Agincourt', 'Battle of Bosworth'],
            correctOptionIndex: 1,
            points: 100
          },
          {
            topicId: historyTopic._id.toString(),
            questionText: 'Which famous treaty, signed in 1648, ended the devastating Thirty Years War in Europe?',
            options: ['Treaty of Versailles', 'Peace of Westphalia', 'Treaty of Utrecht', 'Edict of Nantes'],
            correctOptionIndex: 1,
            points: 100
          },
          {
            topicId: historyTopic._id.toString(),
            questionText: 'Who was the first official Emperor of the newly founded Roman Empire?',
            options: ['Julius Caesar', 'Augustus', 'Nero', 'Marcus Aurelius'],
            correctOptionIndex: 1,
            points: 100
          },
          {
            topicId: historyTopic._id.toString(),
            questionText: 'The historic Great Wall of China was unified and expanded massively during which dynamic Dynasty?',
            options: ['Qin Dynasty', 'Tang Dynasty', 'Song Dynasty', 'Ming Dynasty'],
            correctOptionIndex: 0,
            points: 100
          },
          {
            topicId: historyTopic._id.toString(),
            questionText: 'Which dynamic female ruler was the last active Pharaoh of Ptolemaic Egypt?',
            options: ['Nefertiti', 'Hatshepsut', 'Cleopatra VII', 'Arsinoe IV'],
            correctOptionIndex: 2,
            points: 100
          }
        ];
        questionsToInsert.push(...historyQs);
      }

      // Vaporwave Pop Culture 10 questions
      if (popTopic) {
        const popQs = [
          {
            topicId: popTopic._id.toString(),
            questionText: 'Which legendary 1982 neon science-fiction movie features the iconic synth soundtrack by Vangelis?',
            options: ['Tron', 'Blade Runner', 'The Terminator', 'RoboCop'],
            correctOptionIndex: 1,
            points: 100
          },
          {
            topicId: popTopic._id.toString(),
            questionText: 'What is the name of the hyper-famous pink virtual idol created in Japan using vocal synthesizer technology?',
            options: ['Hatsune Miku', 'Ami Kawashima', 'Sailor Moon', 'Motoko Kusanagi'],
            correctOptionIndex: 0,
            points: 100
          },
          {
            topicId: popTopic._id.toString(),
            questionText: 'Which foundational arcade game released by Taito in 1978 triggered a temporary coin shortage in Japan?',
            options: ['Pac-Man', 'Space Invaders', 'Donkey Kong', 'Galaxian'],
            correctOptionIndex: 1,
            points: 100
          },
          {
            topicId: popTopic._id.toString(),
            questionText: 'What year did Nintendo launch the legendary original Game Boy handheld system in North America?',
            options: ['1985', '1989', '1992', '1995'],
            correctOptionIndex: 1,
            points: 100
          },
          {
            topicId: popTopic._id.toString(),
            questionText: 'The highly acclaimed Vaporwave musical subgenre often sampling elevator music is named what?',
            options: ['Mallsoft', 'Future Funk', 'Synthwave', 'Chiptune'],
            correctOptionIndex: 0,
            points: 100
          },
          {
            topicId: popTopic._id.toString(),
            questionText: 'In which retro classic movie does the character say, "Where we are going, we do not need roads"?',
            options: ['Back to the Future', 'The Matrix', 'WarGames', 'Tron'],
            correctOptionIndex: 0,
            points: 100
          },
          {
            topicId: popTopic._id.toString(),
            questionText: 'What iconic electronic drum machine, released in 1980, defined the sound of 80s pop, hip-hop, and synth music?',
            options: ['Roland TR-808', 'Korg Volca', 'Yamaha DX7', 'Akai MPC60'],
            correctOptionIndex: 0,
            points: 100
          },
          {
            topicId: popTopic._id.toString(),
            questionText: 'Which legendary cyber-thriller anime film of 1995 deals with the "Puppet Master" hacking human cyber-brains?',
            options: ['Akira', 'Neon Genesis Evangelion', 'Ghost in the Shell', 'Cowboy Bebop'],
            correctOptionIndex: 2,
            points: 100
          },
          {
            topicId: popTopic._id.toString(),
            questionText: 'What console did Sega release in 1999 as its ultimate, final entry into the hardware race?',
            options: ['Sega Saturn', 'Sega Genesis', 'Sega Dreamcast', 'Sega Master System'],
            correctOptionIndex: 2,
            points: 100
          },
          {
            topicId: popTopic._id.toString(),
            questionText: 'Which color palette is overwhelmingly iconic in classic vaporwave digital art assets?',
            options: ['Crimson and Gold', 'Olive and Beige', 'Neon Cyan and Magenta', 'Brown and Charcoal'],
            correctOptionIndex: 2,
            points: 100
          }
        ];
        questionsToInsert.push(...popQs);
      }

      // Cyber Security 10 questions
      if (cyberTopic) {
        const cyberQs = [
          {
            topicId: cyberTopic._id.toString(),
            questionText: 'What specific type of exploit targets software vulnerabilities before a developer can release a patch?',
            options: ['Buffer Overflow', 'Zero-Day Exploit', 'Man-in-the-Middle', 'SQL Injection'],
            correctOptionIndex: 1,
            points: 100
          },
          {
            topicId: cyberTopic._id.toString(),
            questionText: 'Which asymmetric cryptographic algorithm relies on the intense mathematical difficulty of factoring large prime numbers?',
            options: ['AES-256', 'DES', 'RSA', 'Diffie-Hellman'],
            correctOptionIndex: 2,
            points: 100
          },
          {
            topicId: cyberTopic._id.toString(),
            questionText: 'What does the abbreviation "WPA" stand for in the context of securing modern wireless networks?',
            options: ['Wired Privacy Access', 'WiFi Protected Access', 'Wireless Protocol Advanced', 'Wide Port Authority'],
            correctOptionIndex: 1,
            points: 100
          },
          {
            topicId: cyberTopic._id.toString(),
            questionText: 'Which extremely destructive cyberworm, discovered in 2010, was custom-built to ruin centrifuges in uranium enrichment facilities?',
            options: ['WannaCry', 'Conficker', 'Stuxnet', 'Petya'],
            correctOptionIndex: 2,
            points: 100
          },
          {
            topicId: cyberTopic._id.toString(),
            questionText: 'What classic social engineering technique tricks users into handing over credentials via a spoofed, lookalike website?',
            options: ['Phishing', 'SQL Injection', 'Bluejacking', 'Replay Attack'],
            correctOptionIndex: 0,
            points: 100
          },
          {
            topicId: cyberTopic._id.toString(),
            questionText: 'Which port is standard for encrypted Secure Shell (SSH) communication channels?',
            options: ['Port 80', 'Port 22', 'Port 443', 'Port 21'],
            correctOptionIndex: 1,
            points: 100
          },
          {
            topicId: cyberTopic._id.toString(),
            questionText: 'What term describes a network of compromised machines controlled remotely by a malicious hacker command center?',
            options: ['Gridnet', 'Botnet', 'Swarmnet', 'ShadowMesh'],
            correctOptionIndex: 1,
            points: 100
          },
          {
            topicId: cyberTopic._id.toString(),
            questionText: 'Which tool is universally utilized for network traffic analysis and deep packet sniffing?',
            options: ['Wireshark', 'Metasploit', 'Nmap', 'Burp Suite'],
            correctOptionIndex: 0,
            points: 100
          },
          {
            topicId: cyberTopic._id.toString(),
            questionText: 'In cryptography, what is a random value called that is appended to password strings before hashing to prevent rainbow table attacks?',
            options: ['Key', 'Salt', 'Nonce', 'Cipher'],
            correctOptionIndex: 1,
            points: 100
          },
          {
            topicId: cyberTopic._id.toString(),
            questionText: 'What cyber attack vector overflows a program memory boundary, writing instructions into executable space?',
            options: ['Cross-Site Scripting', 'Buffer Overflow', 'DNS Poisoning', 'Directory Traversal'],
            correctOptionIndex: 1,
            points: 100
          }
        ];
        questionsToInsert.push(...cyberQs);
      }

      await Question.insertMany(questionsToInsert);
      console.log(`Seeded ${questionsToInsert.length} core dynamic questions into database.`);
    } else {
      console.log('Questions collection already populated with', questionCount, 'documents.');
    }

    // 3. SEED INITIAL LEADERBOARD HIGH SCORES (SESSIONS)
    const sessionCount = await Session.countDocuments();
    if (sessionCount === 0 && seededTopics.length > 0) {
      console.log('Seeding top-tier cognitive players to global live feed...');
      const targetTopic = seededTopics[0];
      const sessionsToInsert = [
        {
          topicId: targetTopic._id.toString(),
          playerName: 'HyperDrive',
          score: 10,
          timeTaken: 42,
          completedAt: new Date(Date.now() - 3600000)
        },
        {
          topicId: targetTopic._id.toString(),
          playerName: 'CyberViper',
          score: 9,
          timeTaken: 48,
          completedAt: new Date(Date.now() - 7200000)
        },
        {
          topicId: targetTopic._id.toString(),
          playerName: 'ZeroCool',
          score: 10,
          timeTaken: 51,
          completedAt: new Date(Date.now() - 10800000)
        },
        {
          topicId: targetTopic._id.toString(),
          playerName: 'QuantumSpur',
          score: 8,
          timeTaken: 38,
          completedAt: new Date(Date.now() - 15000000)
        },
        {
          topicId: targetTopic._id.toString(),
          playerName: 'ArcadeTitan',
          score: 9,
          timeTaken: 55,
          completedAt: new Date(Date.now() - 20000000)
        }
      ];
      await Session.insertMany(sessionsToInsert);
      console.log('Seeded initial leaderboard sessions.');
    }

    console.log('Database seeding process completed successfully!');
  } catch (error) {
    console.error('CRITICAL: Error seeding the database:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Database connection gracefully terminated.');
  }
}

// Execute seed command
seedDatabase();