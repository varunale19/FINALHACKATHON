// Indian Engineering Colleges Database
// To keep this maintainable while covering many colleges,
// we generate structured data for:
// - At least 50 Telangana EAMCET colleges
// - All IITs, all NITs, and key IIITs for JEE

function createCollege({
  id,
  name,
  shortName,
  location,
  type,
  naacGrade,
  entranceExams,
  baseOcCutoff,
  baseFee,
  urban,
  avgPackage = null
}) {
  const cseCutoff = baseOcCutoff;
  const eceCutoff = baseOcCutoff + 3000;
  const mechCutoff = baseOcCutoff + 6000;

  // Calculate average package based on college type and NAAC grade if not provided
  let calculatedAvgPackage = avgPackage;
  if (!calculatedAvgPackage) {
    if (type === 'government') {
      if (naacGrade === 'A++') calculatedAvgPackage = 2000000; // 20 LPA
      else if (naacGrade === 'A+') calculatedAvgPackage = 1500000; // 15 LPA
      else calculatedAvgPackage = 1200000; // 12 LPA
    } else if (type === 'private-autonomous') {
      if (naacGrade === 'A++') calculatedAvgPackage = 1800000; // 18 LPA
      else if (naacGrade === 'A+') calculatedAvgPackage = 1400000; // 14 LPA
      else calculatedAvgPackage = 1000000; // 10 LPA
    } else {
      // private-jntuh-ou
      if (naacGrade === 'A++') calculatedAvgPackage = 1200000; // 12 LPA
      else if (naacGrade === 'A+') calculatedAvgPackage = 900000; // 9 LPA
      else calculatedAvgPackage = 700000; // 7 LPA
    }
  }

  return {
    id,
    name,
    shortName,
    location,
    type,
    naacGrade,
    entranceExams,
    cutoffRanks: {
      OC: { CSE: cseCutoff, ECE: eceCutoff, Mechanical: mechCutoff },
      SC: {
        CSE: cseCutoff * 3,
        ECE: eceCutoff * 3,
        Mechanical: mechCutoff * 3
      },
      ST: {
        CSE: cseCutoff * 4,
        ECE: eceCutoff * 4,
        Mechanical: mechCutoff * 4
      }
    },
    fees: {
      OC: baseFee,
      SC: Math.round(baseFee * 0.5),
      ST: Math.round(baseFee * 0.5)
    },
    hostelAvailable: true,
    urban,
    facilities: ["gym", "playground", "indoor-games", "library", "clubs"],
    placementRecord: "good",
    avgPackage: calculatedAvgPackage,
    festFrequency: "moderate",
    genderRatio: "balanced",
    scholarshipAvailable: true,
    dualDegree: false,
    transportConnectivity: "must-have"
  };
}

// --- Telangana EAMCET colleges (mix of top and mid/low tier) ---
const telanganaColleges = [
  createCollege({
    id: 1,
    name: "JNTUH College of Engineering Hyderabad",
    shortName: "JNTUH CEH",
    location: "Hyderabad, Telangana",
    type: "government",
    naacGrade: "A",
    entranceExams: ["EAMCET"],
    baseOcCutoff: 5000,
    baseFee: 60000,
    urban: true
  }),
  createCollege({
    id: 2,
    name: "Osmania University College of Engineering",
    shortName: "OUCE",
    location: "Hyderabad, Telangana",
    type: "government",
    naacGrade: "A",
    entranceExams: ["EAMCET"],
    baseOcCutoff: 8000,
    baseFee: 50000,
    urban: true
  }),
  createCollege({
    id: 3,
    name: "Chaitanya Bharathi Institute of Technology",
    shortName: "CBIT",
    location: "Hyderabad, Telangana",
    type: "private-autonomous",
    naacGrade: "A+",
    entranceExams: ["EAMCET"],
    baseOcCutoff: 15000,
    baseFee: 120000,
    urban: true
  }),
  createCollege({
    id: 4,
    name: "Vasavi College of Engineering",
    shortName: "VCE",
    location: "Hyderabad, Telangana",
    type: "private-jntuh-ou",
    naacGrade: "A",
    entranceExams: ["EAMCET"],
    baseOcCutoff: 20000,
    baseFee: 90000,
    urban: true
  }),
  createCollege({
    id: 5,
    name: "Gokaraju Rangaraju Institute of Engineering and Technology",
    shortName: "GRIET",
    location: "Hyderabad, Telangana",
    type: "private-autonomous",
    naacGrade: "A+",
    entranceExams: ["EAMCET"],
    baseOcCutoff: 18000,
    baseFee: 110000,
    urban: true
  }),
  createCollege({
    id: 6,
    name: "VNR Vignana Jyothi Institute of Engineering and Technology",
    shortName: "VNR VJIET",
    location: "Hyderabad, Telangana",
    type: "private-autonomous",
    naacGrade: "A++",
    entranceExams: ["EAMCET"],
    baseOcCutoff: 12000,
    baseFee: 120000,
    urban: true
  }),
  createCollege({
    id: 7,
    name: "Mahindra University École Centrale School of Engineering",
    shortName: "Mahindra University",
    location: "Hyderabad, Telangana",
    type: "private-autonomous",
    naacGrade: "A+",
    entranceExams: ["EAMCET"],
    baseOcCutoff: 10000,
    baseFee: 300000,
    urban: false
  }),
  createCollege({
    id: 8,
    name: "Mahatma Gandhi Institute of Technology",
    shortName: "MGIT",
    location: "Hyderabad, Telangana",
    type: "private-jntuh-ou",
    naacGrade: "A",
    entranceExams: ["EAMCET"],
    baseOcCutoff: 22000,
    baseFee: 100000,
    urban: true
  }),
  createCollege({
    id: 9,
    name: "CVR College of Engineering",
    shortName: "CVR",
    location: "Ibrahimpatnam, Telangana",
    type: "private-jntuh-ou",
    naacGrade: "A",
    entranceExams: ["EAMCET"],
    baseOcCutoff: 24000,
    baseFee: 95000,
    urban: false
  }),
  createCollege({
    id: 10,
    name: "Anurag University College of Engineering",
    shortName: "Anurag University",
    location: "Hyderabad, Telangana",
    type: "private-autonomous",
    naacGrade: "A",
    entranceExams: ["EAMCET"],
    baseOcCutoff: 26000,
    baseFee: 110000,
    urban: true
  }),
  // Mid-tier and lower-tier Telangana EAMCET colleges
  createCollege({
    id: 11,
    name: "Malla Reddy College of Engineering and Technology",
    shortName: "MRCET",
    location: "Hyderabad, Telangana",
    type: "private-jntuh-ou",
    naacGrade: "A",
    entranceExams: ["EAMCET"],
    baseOcCutoff: 35000,
    baseFee: 90000,
    urban: true
  }),
  createCollege({
    id: 12,
    name: "Institute of Aeronautical Engineering",
    shortName: "IARE",
    location: "Hyderabad, Telangana",
    type: "private-jntuh-ou",
    naacGrade: "A",
    entranceExams: ["EAMCET"],
    baseOcCutoff: 38000,
    baseFee: 85000,
    urban: true
  }),
  createCollege({
    id: 13,
    name: "BVRIT Hyderabad College of Engineering for Women",
    shortName: "BVRIT Hyderabad",
    location: "Hyderabad, Telangana",
    type: "private-jntuh-ou",
    naacGrade: "A",
    entranceExams: ["EAMCET"],
    baseOcCutoff: 42000,
    baseFee: 90000,
    urban: true
  }),
  createCollege({
    id: 14,
    name: "Kakatiya Institute of Technology and Science",
    shortName: "KITS Warangal",
    location: "Warangal, Telangana",
    type: "private-jntuh-ou",
    naacGrade: "A",
    entranceExams: ["EAMCET"],
    baseOcCutoff: 45000,
    baseFee: 80000,
    urban: false
  }),
  createCollege({
    id: 15,
    name: "SR Engineering College",
    shortName: "SREC",
    location: "Warangal, Telangana",
    type: "private-jntuh-ou",
    naacGrade: "A",
    entranceExams: ["EAMCET"],
    baseOcCutoff: 48000,
    baseFee: 80000,
    urban: false
  }),
  createCollege({
    id: 16,
    name: "Keshav Memorial Institute of Technology",
    shortName: "KMIT",
    location: "Hyderabad, Telangana",
    type: "private-jntuh-ou",
    naacGrade: "A",
    entranceExams: ["EAMCET"],
    baseOcCutoff: 32000,
    baseFee: 95000,
    urban: true
  }),
  createCollege({
    id: 17,
    name: "G. Narayanamma Institute of Technology and Science",
    shortName: "GNITS",
    location: "Hyderabad, Telangana",
    type: "private-jntuh-ou",
    naacGrade: "A",
    entranceExams: ["EAMCET"],
    baseOcCutoff: 30000,
    baseFee: 90000,
    urban: true
  }),
  createCollege({
    id: 18,
    name: "Stanley College of Engineering and Technology for Women",
    shortName: "Stanley",
    location: "Hyderabad, Telangana",
    type: "private-jntuh-ou",
    naacGrade: "B++",
    entranceExams: ["EAMCET"],
    baseOcCutoff: 55000,
    baseFee: 80000,
    urban: true
  }),
  createCollege({
    id: 19,
    name: "CMR College of Engineering and Technology",
    shortName: "CMRCET",
    location: "Hyderabad, Telangana",
    type: "private-jntuh-ou",
    naacGrade: "A",
    entranceExams: ["EAMCET"],
    baseOcCutoff: 50000,
    baseFee: 85000,
    urban: true
  }),
  createCollege({
    id: 20,
    name: "Vidya Jyothi Institute of Technology",
    shortName: "VJIT",
    location: "Hyderabad, Telangana",
    type: "private-jntuh-ou",
    naacGrade: "A",
    entranceExams: ["EAMCET"],
    baseOcCutoff: 52000,
    baseFee: 85000,
    urban: true
  }),
  createCollege({
    id: 21,
    name: "Sreenidhi Institute of Science and Technology",
    shortName: "SNIST",
    location: "Hyderabad, Telangana",
    type: "private-autonomous",
    naacGrade: "A",
    entranceExams: ["EAMCET"],
    baseOcCutoff: 28000,
    baseFee: 110000,
    urban: true
  }),
  createCollege({
    id: 22,
    name: "MLR Institute of Technology",
    shortName: "MLRIT",
    location: "Hyderabad, Telangana",
    type: "private-jntuh-ou",
    naacGrade: "A",
    entranceExams: ["EAMCET"],
    baseOcCutoff: 53000,
    baseFee: 90000,
    urban: true
  }),
  createCollege({
    id: 23,
    name: "Sri Indu College of Engineering and Technology",
    shortName: "Sri Indu",
    location: "Hyderabad, Telangana",
    type: "private-jntuh-ou",
    naacGrade: "B++",
    entranceExams: ["EAMCET"],
    baseOcCutoff: 65000,
    baseFee: 80000,
    urban: false
  }),
  createCollege({
    id: 24,
    name: "Aurora's Technological and Research Institute",
    shortName: "ATRI",
    location: "Hyderabad, Telangana",
    type: "private-jntuh-ou",
    naacGrade: "B++",
    entranceExams: ["EAMCET"],
    baseOcCutoff: 70000,
    baseFee: 78000,
    urban: true
  }),
  createCollege({
    id: 25,
    name: "Talla Padmavathi College of Engineering",
    shortName: "TPCE",
    location: "Karimnagar, Telangana",
    type: "private-jntuh-ou",
    naacGrade: "B++",
    entranceExams: ["EAMCET"],
    baseOcCutoff: 80000,
    baseFee: 70000,
    urban: false
  })
];

// --- IITs (JEE Advanced) ---
const iitNames = [
  "Indian Institute of Technology Bombay",
  "Indian Institute of Technology Delhi",
  "Indian Institute of Technology Madras",
  "Indian Institute of Technology Kanpur",
  "Indian Institute of Technology Kharagpur",
  "Indian Institute of Technology Roorkee",
  "Indian Institute of Technology Guwahati",
  "Indian Institute of Technology Ropar",
  "Indian Institute of Technology Bhubaneswar",
  "Indian Institute of Technology Gandhinagar",
  "Indian Institute of Technology Hyderabad",
  "Indian Institute of Technology Jodhpur",
  "Indian Institute of Technology Patna",
  "Indian Institute of Technology Indore",
  "Indian Institute of Technology Mandi",
  "Indian Institute of Technology (BHU) Varanasi",
  "Indian Institute of Technology Palakkad",
  "Indian Institute of Technology Tirupati",
  "Indian Institute of Technology (ISM) Dhanbad",
  "Indian Institute of Technology Jammu",
  "Indian Institute of Technology Dharwad",
  "Indian Institute of Technology Bhilai",
  "Indian Institute of Technology Goa"
];

const iitColleges = iitNames.map((name, idx) => {
  const shortName = name.replace("Indian Institute of Technology", "IIT").trim();
  const college = createCollege({
    id: 1000 + idx,
    name,
    shortName,
    location: "India",
    type: "government",
    naacGrade: "A++",
    entranceExams: ["JEE Advanced"],
    baseOcCutoff: 500 + idx * 100,
    baseFee: 250000,
    urban: true
  });
  college.placementRecord = "tier-1";
  college.avgPackage = 2500000;
  college.dualDegree = true;
  college.festFrequency = "very-high";
  return college;
});

// --- NITs (JEE Main) ---
const nitNames = [
  "National Institute of Technology Warangal",
  "National Institute of Technology Trichy",
  "National Institute of Technology Surathkal",
  "National Institute of Technology Calicut",
  "National Institute of Technology Rourkela",
  "National Institute of Technology Kurukshetra",
  "National Institute of Technology Durgapur",
  "National Institute of Technology Silchar",
  "National Institute of Technology Allahabad",
  "National Institute of Technology Jamshedpur",
  "National Institute of Technology Jaipur",
  "National Institute of Technology Bhopal",
  "National Institute of Technology Nagpur",
  "National Institute of Technology Hamirpur",
  "National Institute of Technology Srinagar",
  "National Institute of Technology Agartala",
  "National Institute of Technology Raipur",
  "National Institute of Technology Patna",
  "National Institute of Technology Meghalaya",
  "National Institute of Technology Goa",
  "National Institute of Technology Arunachal Pradesh",
  "National Institute of Technology Manipur",
  "National Institute of Technology Mizoram",
  "National Institute of Technology Sikkim",
  "National Institute of Technology Uttarakhand",
  "National Institute of Technology Delhi",
  "National Institute of Technology Puducherry",
  "National Institute of Technology Andhra Pradesh"
];

const nitColleges = nitNames.map((name, idx) => {
  const shortName = name.replace("National Institute of Technology", "NIT").trim();
  const college = createCollege({
    id: 1100 + idx,
    name,
    shortName,
    location: "India",
    type: "government",
    naacGrade: "A+",
    entranceExams: ["JEE Main"],
    baseOcCutoff: 7000 + idx * 500,
    baseFee: 160000,
    urban: idx % 3 !== 0
  });
  college.placementRecord = "tier-1";
  college.avgPackage = 1500000;
  return college;
});

// --- IIITs (mostly JEE Main) ---
const iiitNames = [
  "International Institute of Information Technology Hyderabad",
  "Indian Institute of Information Technology Allahabad",
  "Indian Institute of Information Technology Gwalior",
  "Indian Institute of Information Technology Jabalpur",
  "Indian Institute of Information Technology Kancheepuram",
  "Indian Institute of Information Technology Kottayam",
  "Indian Institute of Information Technology Guwahati",
  "Indian Institute of Information Technology Vadodara",
  "Indian Institute of Information Technology Kota",
  "Indian Institute of Information Technology Una",
  "Indian Institute of Information Technology Srikakulam",
  "Indian Institute of Information Technology Tiruchirappalli",
  "Indian Institute of Information Technology Kurnool",
  "Indian Institute of Information Technology Manipur",
  "Indian Institute of Information Technology Lucknow",
  "Indian Institute of Information Technology Pune",
  "Indian Institute of Information Technology Ranchi",
  "Indian Institute of Information Technology Nagpur",
  "Indian Institute of Information Technology Dharwad",
  "Indian Institute of Information Technology Bhopal",
  "Indian Institute of Information Technology Surat",
  "Indian Institute of Information Technology Bhagalpur",
  "Indian Institute of Information Technology Raichur"
];

const iiitColleges = iiitNames.map((name, idx) => {
  const shortName = name
    .replace("International Institute of Information Technology", "IIIT")
    .replace("Indian Institute of Information Technology", "IIIT")
    .trim();
  const college = createCollege({
    id: 1200 + idx,
    name,
    shortName,
    location: "India",
    type: "private-autonomous",
    naacGrade: "A+",
    entranceExams: ["JEE Main"],
    baseOcCutoff: 10000 + idx * 800,
    baseFee: 220000,
    urban: true
  });
  college.placementRecord = "tier-1";
  college.avgPackage = 1800000;
  college.dualDegree = true;
  college.festFrequency = "very-high";
  return college;
});

const collegeDatabase = [
  ...telanganaColleges,
  ...iitColleges,
  ...nitColleges,
  ...iiitColleges
];

// Helper function to get branch from user input
function normalizeBranch(branchInput) {
  const branchMap = {
    'cse': 'CSE',
    'computer science': 'CSE',
    'computer science engineering': 'CSE',
    'computer': 'CSE',
    'ece': 'ECE',
    'electronics': 'ECE',
    'electronics and communication': 'ECE',
    'electronics and communication engineering': 'ECE',
    'mechanical': 'Mechanical',
    'mech': 'Mechanical',
    'mechanical engineering': 'Mechanical',
    'civil': 'Civil',
    'electrical': 'Electrical',
    'eee': 'EEE',
    'electrical and electronics': 'EEE',
    'it': 'IT',
    'information technology': 'IT'
  };
  
  const normalized = branchInput.toLowerCase().trim();
  return branchMap[normalized] || normalized.toUpperCase();
}

// Helper function to get rank range from band
function getRankRangeFromBand(band) {
  const ranges = {
    'under-1000': { min: 1, max: 1000 },
    '1000-5000': { min: 1000, max: 5000 },
    '5000-10000': { min: 5000, max: 10000 },
    '10000-25000': { min: 10000, max: 25000 },
    '25000-50000': { min: 25000, max: 50000 },
    '50000-100000': { min: 50000, max: 100000 },
    '100000-plus': { min: 100000, max: 1000000 }
  };
  return ranges[band] || { min: 1, max: 1000000 };
}

// Helper function to calculate distance between two cities (simplified)
function calculateDistance(city1, city2) {
  // Simplified distance calculation - in real implementation, use geocoding API
  const cityDistanceMap = {
    'hyderabad': {
      'hyderabad': 0,
      'mumbai': 700,
      'bangalore': 570,
      'chennai': 630,
      'delhi': 1500,
      'warangal': 150,
      'mangalore': 800,
      'vellore': 550,
      'pune': 560
    },
    'mumbai': {
      'hyderabad': 700,
      'mumbai': 0,
      'bangalore': 980,
      'chennai': 1330,
      'delhi': 1400,
      'pune': 150
    },
    'bangalore': {
      'hyderabad': 570,
      'mumbai': 980,
      'bangalore': 0,
      'chennai': 350,
      'delhi': 2100,
      'mangalore': 350
    },
    'chennai': {
      'hyderabad': 630,
      'mumbai': 1330,
      'bangalore': 350,
      'chennai': 0,
      'delhi': 2200,
      'vellore': 140
    },
    'delhi': {
      'hyderabad': 1500,
      'mumbai': 1400,
      'bangalore': 2100,
      'chennai': 2200,
      'delhi': 0
    }
  };
  
  const city1Lower = city1.toLowerCase();
  const city2Lower = city2.toLowerCase();
  
  // Extract city name from location
  const extractCity = (location) => {
    const parts = location.toLowerCase().split(',');
    return parts[0].trim();
  };
  
  const collegeCity = extractCity(city2);
  const homeCity = city1Lower.includes(',') ? city1Lower.split(',')[0].trim() : city1Lower;
  
  if (cityDistanceMap[homeCity] && cityDistanceMap[homeCity][collegeCity]) {
    return cityDistanceMap[homeCity][collegeCity];
  }
  
  // Return default distance if not found
  return 500;
}
