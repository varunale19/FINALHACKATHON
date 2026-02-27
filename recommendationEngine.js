// AI-Powered College Recommendation Engine

class CollegeRecommendationEngine {
  constructor() {
    this.weights = {
      rankFit: 0.30,        // How well the rank matches cutoff
      budgetFit: 0.20,      // How well it fits the budget
      locationFit: 0.15,    // Location and distance preferences
      facilitiesFit: 0.10,   // Campus facilities match
      placementFit: 0.10,    // Placement record importance
      typeFit: 0.08,        // College type preference
      naacFit: 0.07         // NAAC grade preference
    };
  }

  // Main recommendation function
  getRecommendations(userPreferences, topN = 10) {
    const scoredColleges = collegeDatabase.map(college => {
      const score = this.calculateCollegeScore(college, userPreferences);
      const suggestedBranches = this.getSuggestedBranches(college, userPreferences);
      return {
        ...college,
        score: score.total,
        scoreBreakdown: score.breakdown,
        matchReasons: score.reasons,
        suggestedBranches: suggestedBranches
      };
    });

    // Filter out colleges with zero score and sort by score
    const validColleges = scoredColleges
      .filter(college => college.score > 0)
      .sort((a, b) => b.score - a.score);

    return validColleges.slice(0, topN);
  }

  // Calculate comprehensive score for a college
  calculateCollegeScore(college, userPrefs) {
    const breakdown = {};
    const reasons = [];
    let totalScore = 0;

    // 1. Rank Fit (30% weight)
    const rankScore = this.calculateRankFit(college, userPrefs);
    breakdown.rankFit = rankScore.score;

    // If exam does not match at all (marked with negative score), drop this college entirely
    if (rankScore.score < 0) {
      return {
        total: 0,
        breakdown: { rankFit: rankScore.score },
        reasons: rankScore.reasons
      };
    }

    totalScore += rankScore.score * this.weights.rankFit;
    if (rankScore.reasons.length > 0) {
      reasons.push(...rankScore.reasons);
    }

    // 2. Budget Fit (20% weight)
    const budgetScore = this.calculateBudgetFit(college, userPrefs);
    breakdown.budgetFit = budgetScore.score;
    totalScore += budgetScore.score * this.weights.budgetFit;
    if (budgetScore.reasons.length > 0) {
      reasons.push(...budgetScore.reasons);
    }

    // 3. Location Fit (15% weight)
    const locationScore = this.calculateLocationFit(college, userPrefs);
    breakdown.locationFit = locationScore.score;
    totalScore += locationScore.score * this.weights.locationFit;
    if (locationScore.reasons.length > 0) {
      reasons.push(...locationScore.reasons);
    }

    // 4. Facilities Fit (10% weight)
    const facilitiesScore = this.calculateFacilitiesFit(college, userPrefs);
    breakdown.facilitiesFit = facilitiesScore.score;
    totalScore += facilitiesScore.score * this.weights.facilitiesFit;
    if (facilitiesScore.reasons.length > 0) {
      reasons.push(...facilitiesScore.reasons);
    }

    // 5. Placement Fit (10% weight)
    const placementScore = this.calculatePlacementFit(college, userPrefs);
    breakdown.placementFit = placementScore.score;
    totalScore += placementScore.score * this.weights.placementFit;
    if (placementScore.reasons.length > 0) {
      reasons.push(...placementScore.reasons);
    }

    // 6. College Type Fit (8% weight)
    const typeScore = this.calculateTypeFit(college, userPrefs);
    breakdown.typeFit = typeScore.score;
    totalScore += typeScore.score * this.weights.typeFit;
    if (typeScore.reasons.length > 0) {
      reasons.push(...typeScore.reasons);
    }

    // 7. NAAC Grade Fit (7% weight)
    const naacScore = this.calculateNaacFit(college, userPrefs);
    breakdown.naacFit = naacScore.score;
    totalScore += naacScore.score * this.weights.naacFit;
    if (naacScore.reasons.length > 0) {
      reasons.push(...naacScore.reasons);
    }

    return {
      total: totalScore,
      breakdown: breakdown,
      reasons: reasons.slice(0, 3) // Top 3 reasons
    };
  }

  // Calculate rank compatibility score
  calculateRankFit(college, userPrefs) {
    const reasons = [];
    let score = 0;

    const examName = (userPrefs.examName || '').toUpperCase();
    const isEamcetMode = examName.includes('EAMCET');
    const isJeeMode = examName.includes('JEE');

    const collegeExamsUpper = (college.entranceExams || []).map(e =>
      (e || '').toUpperCase()
    );

    // Filter by exam compatibility
    if (isEamcetMode) {
      // EAMCET mode: only colleges that explicitly accept EAMCET
      const acceptsEamcet = collegeExamsUpper.some(e => e.includes('EAMCET'));
      if (!acceptsEamcet) {
        return {
          score: -1,
          reasons: ["College doesn't accept EAMCET"],
        };
      }

      // And only within Telangana state
      const locationLower = (college.location || '').toLowerCase();
      const isTelanganaCollege = locationLower.includes('telangana');
      if (!isTelanganaCollege) {
        return {
          score: -1,
          reasons: ["EAMCET recommendations are limited to Telangana colleges"],
        };
      }
    } else if (isJeeMode) {
      // JEE mode: any college that accepts JEE Main or JEE Advanced
      const acceptsJee = collegeExamsUpper.some(e => e.includes('JEE'));
      if (!acceptsJee) {
        return {
          score: -1,
          reasons: ["College doesn't accept JEE (Main/Advanced)"],
        };
      }
    } else {
      // Fallback: exact match with stored exam names
      if (!collegeExamsUpper.includes(examName)) {
        return {
          score: -1,
          reasons: ["College doesn't accept " + (userPrefs.examName || 'this exam')],
        };
      }
    }

    const category = userPrefs.category || 'OC';
    const branch = normalizeBranch(userPrefs.requiredBranch || 'CSE');
    reasons.push(`Evaluated for branch: ${branch}`);
    
    // Get cutoff for this category and branch
    const cutoffRanks = college.cutoffRanks[category];
    if (!cutoffRanks || !cutoffRanks[branch]) {
      // No specific cutoff data, give a neutral score so other preferences decide
      return { score: 55, reasons: ["No cutoff data available, using neutral match score"] };
    }

    const cutoff = cutoffRanks[branch];
    let userRank;

    // Use exact rank if provided; otherwise fall back to neutral score
    if (userPrefs.examRank && String(userPrefs.examRank).trim() !== '') {
      userRank = parseInt(userPrefs.examRank);
    } else {
      // No rank information – keep a mid score so preferences still work
      return { score: 60, reasons: ["No rank information provided, using neutral match score"] };
    }

    // Calculate score based on how much better the rank is than cutoff
    if (userRank <= cutoff) {
      if (userRank <= cutoff * 0.5) {
        score = 100; // Excellent rank
        reasons.push(`Excellent rank - well within cutoff`);
      } else if (userRank <= cutoff * 0.8) {
        score = 85; // Good rank
        reasons.push(`Good rank - comfortably within cutoff`);
      } else {
        score = 70; // Just made it
        reasons.push(`Within cutoff range`);
      }
    } else {
      const excess = userRank - cutoff;
      const excessPercentage = excess / cutoff;
      
      if (excessPercentage <= 0.1) {
        score = 60; // Slightly above cutoff
        reasons.push(`Slightly above cutoff - close call`);
      } else if (excessPercentage <= 0.25) {
        score = 40; // Moderately above cutoff
        reasons.push(`Above cutoff but might have chance`);
      } else {
        // Rank much worse than cutoff – still keep a small score so
        // lower-rank students see at least some options.
        score = 25;
        reasons.push(`Rank well above cutoff - low chance, shown as stretch option`);
      }
    }

    return { score, reasons };
  }

  // Calculate budget compatibility score
  calculateBudgetFit(college, userPrefs) {
    const reasons = [];
    let score = 100;

    const category = userPrefs.category || 'OC';
    const collegeFee = college.fees[category] || college.fees['OC'];

    // Check if budget constraints are specified
    if (!userPrefs.budgetMin && !userPrefs.budgetMax) {
      return { score: 50, reasons: ["No budget specified"] };
    }

    const minBudget = userPrefs.budgetMin ? parseInt(userPrefs.budgetMin) : 0;
    const maxBudget = userPrefs.budgetMax ? parseInt(userPrefs.budgetMax) : Infinity;

    if (collegeFee < minBudget) {
      score = 30; // Below minimum budget
      reasons.push(`Fee (₹${collegeFee.toLocaleString()}) below your minimum budget`);
    } else if (collegeFee > maxBudget) {
      score = 0; // Above maximum budget
      reasons.push(`Fee (₹${collegeFee.toLocaleString()}) exceeds your budget`);
    } else {
      // Within budget range
      const budgetPosition = (collegeFee - minBudget) / (maxBudget - minBudget);
      if (budgetPosition < 0.3) {
        score = 95;
        reasons.push(`Well within budget - great value`);
      } else if (budgetPosition < 0.7) {
        score = 80;
        reasons.push(`Comfortably within budget`);
      } else {
        score = 65;
        reasons.push(`Within budget but on higher side`);
      }
    }

    return { score, reasons };
  }

  // Calculate location compatibility score
  calculateLocationFit(college, userPrefs) {
    const reasons = [];
    let score = 100;

    // Hostel preference
    if (userPrefs.hostelPreference === 'no' && !college.hostelAvailable) {
      score = 0;
      reasons.push(`Hostel required but not available`);
      return { score, reasons };
    }

    // Urban/Rural preference
    if (userPrefs.collegeArea && userPrefs.collegeArea !== 'either') {
      if (userPrefs.collegeArea === 'urban' && !college.urban) {
        score -= 20;
        reasons.push(`College is in rural area`);
      } else if (userPrefs.collegeArea === 'rural' && college.urban) {
        score -= 20;
        reasons.push(`College is in urban area`);
      }
    }

    // Distance from home
    if (userPrefs.homeLocation && userPrefs.maxDistanceKm) {
      const distance = calculateDistance(userPrefs.homeLocation, college.location);
      const maxDistance = parseInt(userPrefs.maxDistanceKm);

      if (distance <= maxDistance) {
        if (distance <= maxDistance * 0.5) {
          score = 100;
          reasons.push(`Very close to home (${distance} km)`);
        } else {
          score = 85;
          reasons.push(`Within preferred distance (${distance} km)`);
        }
      } else {
        const excess = distance - maxDistance;
        const excessPercentage = excess / maxDistance;
        
        if (excessPercentage <= 0.25) {
          score = 60;
          reasons.push(`Slightly beyond preferred distance (${distance} km)`);
        } else {
          score = 30;
          reasons.push(`Much farther than preferred (${distance} km)`);
        }
      }
    }

    // Transport connectivity
    if (userPrefs.transportImportance) {
      const transportMatch = this.matchTransportPreference(college.transportConnectivity, userPrefs.transportImportance);
      score = score * transportMatch.score / 100;
      if (transportMatch.reason) {
        reasons.push(transportMatch.reason);
      }
    }

    return { score: Math.max(0, score), reasons };
  }

  // Calculate facilities compatibility score
  calculateFacilitiesFit(college, userPrefs) {
    const reasons = [];
    let score = 100;

    if (!userPrefs.facilities || userPrefs.facilities.length === 0) {
      return { score: 50, reasons: ["No facility preferences specified"] };
    }

    const requiredFacilities = userPrefs.facilities;
    const availableFacilities = college.facilities;

    const matchedFacilities = requiredFacilities.filter(facility => 
      availableFacilities.includes(facility)
    );

    const matchPercentage = matchedFacilities.length / requiredFacilities.length;
    score = matchPercentage * 100;

    if (matchPercentage === 1) {
      reasons.push(`All preferred facilities available`);
    } else if (matchPercentage >= 0.7) {
      reasons.push(`Most preferred facilities available`);
    } else if (matchPercentage >= 0.4) {
      reasons.push(`Some preferred facilities available`);
    } else {
      reasons.push(`Few preferred facilities available`);
    }

    return { score, reasons };
  }

  // Calculate placement compatibility score
  calculatePlacementFit(college, userPrefs) {
    const reasons = [];
    let score = 100;

    if (!userPrefs.placementImportance) {
      return { score: 50, reasons: ["No placement preference specified"] };
    }

    const placementLevels = {
      'tier-1': 100,
      'good': 75,
      'ok': 50
    };

    const userLevel = placementLevels[userPrefs.placementImportance] || 50;
    const collegeLevel = placementLevels[college.placementRecord] || 50;

    if (collegeLevel >= userLevel) {
      score = 100;
      reasons.push(`Excellent placement record (₹${college.avgPackage.toLocaleString()} avg package)`);
    } else if (collegeLevel >= userLevel * 0.8) {
      score = 75;
      reasons.push(`Good placement record (₹${college.avgPackage.toLocaleString()} avg package)`);
    } else {
      score = 50;
      reasons.push(`Decent placement record (₹${college.avgPackage.toLocaleString()} avg package)`);
    }

    return { score, reasons };
  }

  // Calculate college type compatibility score
  calculateTypeFit(college, userPrefs) {
    const reasons = [];
    let score = 100;

    if (!userPrefs.collegeType || userPrefs.collegeType.length === 0) {
      return { score: 50, reasons: ["No college type preference specified"] };
    }

    if (userPrefs.collegeType.includes('any')) {
      score = 100;
      reasons.push(`College type preference flexible`);
    } else if (userPrefs.collegeType.includes(college.type)) {
      score = 100;
      reasons.push(`Matches preferred college type`);
    } else {
      score = 0;
      reasons.push(`Doesn't match preferred college type`);
    }

    return { score, reasons };
  }

  // Calculate NAAC grade compatibility score
  calculateNaacFit(college, userPrefs) {
    const reasons = [];
    let score = 100;

    if (!userPrefs.naacGrade) {
      return { score: 50, reasons: ["No NAAC grade preference specified"] };
    }

    const gradeOrder = ['A++', 'A+', 'A', 'B++'];
    const collegeGradeIndex = gradeOrder.indexOf(college.naacGrade);
    
    let minGradeIndex;
    if (userPrefs.naacGrade === 'B++') {
      minGradeIndex = 3; // B++ or above
    } else {
      minGradeIndex = gradeOrder.indexOf(userPrefs.naacGrade);
    }

    if (collegeGradeIndex <= minGradeIndex) {
      score = 100;
      reasons.push(`Meets NAAC grade requirement (${college.naacGrade})`);
    } else {
      score = 0;
      reasons.push(`Below required NAAC grade (${college.naacGrade})`);
    }

    return { score, reasons };
  }

  // Get suggested branches based on user's rank
  getSuggestedBranches(college, userPrefs) {
    const category = userPrefs.category || 'OC';
    const userRank = userPrefs.examRank ? parseInt(userPrefs.examRank) : null;
    
    if (!userRank) {
      return [{
        branch: normalizeBranch(userPrefs.requiredBranch || 'CSE'),
        chance: 'No rank data',
        status: 'unknown'
      }];
    }

    const cutoffRanks = college.cutoffRanks[category];
    if (!cutoffRanks) {
      return [{
        branch: normalizeBranch(userPrefs.requiredBranch || 'CSE'),
        chance: 'No cutoff data',
        status: 'unknown'
      }];
    }

    const branches = ['CSE', 'ECE', 'Mechanical', 'Civil', 'EEE', 'IT'];
    const suggestions = [];

    branches.forEach(branch => {
      const cutoff = cutoffRanks[branch];
      if (!cutoff) return;

      let chance, status;
      if (userRank <= cutoff * 0.5) {
        chance = 'Very High';
        status = 'excellent';
      } else if (userRank <= cutoff * 0.8) {
        chance = 'High';
        status = 'good';
      } else if (userRank <= cutoff) {
        chance = 'Good';
        status = 'safe';
      } else if (userRank <= cutoff * 1.2) {
        chance = 'Moderate';
        status = 'stretch';
      } else {
        chance = 'Low';
        status = 'difficult';
      }

      suggestions.push({
        branch,
        chance,
        status,
        cutoff: cutoff
      });
    });

    // Sort by chance (best chances first)
    const statusOrder = { 'excellent': 0, 'good': 1, 'safe': 2, 'stretch': 3, 'difficult': 4 };
    suggestions.sort((a, b) => statusOrder[a.status] - statusOrder[b.status]);

    return suggestions.slice(0, 3); // Show top 3 branch suggestions
  }

  // Helper function to match transport preferences
  matchTransportPreference(collegeTransport, userPreference) {
    const transportLevels = {
      'must-have': { 'must-have': 100, 'good-to-have': 70, 'not-important': 50 },
      'good-to-have': { 'must-have': 100, 'good-to-have': 100, 'not-important': 70 },
      'not-important': { 'must-have': 100, 'good-to-have': 100, 'not-important': 100 }
    };

    const score = transportLevels[userPreference][collegeTransport] || 50;
    let reason = '';

    if (score === 100) {
      reason = 'Transport connectivity matches preference';
    } else if (score >= 70) {
      reason = 'Transport connectivity acceptable';
    } else {
      reason = 'Transport connectivity below preference';
    }

    return { score, reason };
  }
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CollegeRecommendationEngine;
}
