// College Results Display Component

class ResultsDisplay {
  constructor() {
    this.container = null;
    this.currentResults = [];
    this.filteredResults = [];
    this.selectedForCompare = [];
  }

  // Initialize the results display
  initialize() {
    this.container = document.getElementById('results-container');
  }

  // Display college recommendations
  displayResults(recommendations, userPreferences) {
    this.currentResults = recommendations || [];
    this.filteredResults = this.currentResults;
    
    const resultsHTML = this.generateResultsHTML(recommendations, userPreferences);
    this.container.innerHTML = resultsHTML;

    this.renderResultsList(this.filteredResults);
    
    // Scroll to results
    this.container.scrollIntoView({ behavior: 'smooth' });
    
    // Add event listeners
    this.attachEventListeners();
  }

  // Generate HTML for results display
  generateResultsHTML(recommendations, userPreferences) {
    const hasResults = recommendations && recommendations.length > 0;
    
    return `
      <div class="results-header">
        <h2>🎓 Your College Recommendations</h2>
        <p class="results-subtitle">
          ${hasResults 
            ? `Found ${recommendations.length} colleges matching your preferences` 
            : 'No colleges found matching your criteria. Try adjusting your preferences.'}
        </p>
        <button class="btn-secondary" onclick="newSearch()">🔄 New Search</button>
      </div>
      ${
        hasResults
          ? `
        <div class="results-search-bar">
          <input
            id="results-search-input"
            class="results-search-input"
            type="text"
            placeholder="Search by college name, location, NAAC, facilities..."
          />
        </div>
        <p class="results-search-hint">
          Tip: Try terms like "Hyderabad", "A++", "government", or a branch name.
        </p>
        <div id="compare-bar" class="compare-bar is-hidden"></div>
        <div id="results-list"></div>
        `
          : this.generateNoResultsHTML()
      }

      <div class="results-footer">
        <div class="disclaimer">
          <p><strong>Note:</strong> Rankings and cutoffs are based on previous year data and may vary. 
          Please verify current information with official college sources.</p>
        </div>
      </div>
    `;
  }

  // Generate individual college cards
  generateCollegeCards(recommendations) {
    return recommendations.map((college, index) => {
      const matchPercentage = Math.round(college.score);
      const matchColor = this.getMatchColor(matchPercentage);
      
      return `
        <div class="college-card" data-college-id="${college.id}">
          <div class="college-header">
            <div class="college-info">
              <h3 class="college-name">${college.name}</h3>
              <p class="college-location">📍 ${college.location}</p>
            </div>
            <div class="match-score" style="background-color: ${matchColor}">
              <span class="match-percentage">${matchPercentage}%</span>
              <span class="match-label">Match</span>
            </div>
          </div>
          
          <div class="college-details">
            <div class="branch-suggestions">
              <h4>🎯 Likely Branches You Can Get:</h4>
              <div class="branch-chips">
                ${college.suggestedBranches.map(suggestion => 
                  `<div class="branch-chip ${suggestion.status}">
                    <span class="branch-name">${suggestion.branch}</span>
                    <span class="branch-chance">${suggestion.chance}</span>
                  </div>`
                ).join('')}
              </div>
            </div>
            
            <div class="detail-grid">
              <div class="detail-item">
                <span class="detail-label">Type:</span>
                <span class="detail-value">${this.formatCollegeType(college.type)}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">NAAC Grade:</span>
                <span class="detail-value">${college.naacGrade}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Avg Package:</span>
                <span class="detail-value">₹${college.avgPackage.toLocaleString()}/year</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Hostel:</span>
                <span class="detail-value">${college.hostelAvailable ? '✅ Available' : '❌ Not Available'}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">OC CSE cutoff:</span>
                <span class="detail-value">
                  ${
                    college.cutoffRanks &&
                    college.cutoffRanks.OC &&
                    college.cutoffRanks.OC.CSE
                      ? `~${college.cutoffRanks.OC.CSE}`
                      : "N/A"
                  }
                </span>
              </div>
            </div>
            
            <div class="match-reasons">
              <h4>Why this college matches you:</h4>
              <ul>
                ${college.matchReasons.map(reason => `<li>${reason}</li>`).join('')}
              </ul>
            </div>
            
            <div class="facilities-section">
              <h4>Campus Facilities:</h4>
              <div class="facilities-tags">
                ${college.facilities.map(facility => 
                  `<span class="facility-tag">${this.formatFacilityName(facility)}</span>`
                ).join('')}
              </div>
            </div>
            
            <div class="college-actions">
              <button class="btn-primary btn-small" onclick="viewCollegeDetails(${college.id})">
                View Details
              </button>
              <button
                class="btn-secondary btn-small compare-btn"
                data-compare-id="${college.id}"
                onclick="addToCompare(${college.id})"
              >
                Add to Compare
              </button>
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  // Generate no results HTML
  generateNoResultsHTML() {
    return `
      <div class="no-results">
        <div class="no-results-icon">🔍</div>
        <h3>No colleges found</h3>
        <p>We couldn't find colleges matching your exact criteria. Here are some suggestions:</p>
        <ul>
          <li>Try increasing your rank range or budget</li>
          <li>Consider different college types</li>
          <li>Be more flexible with location preferences</li>
          <li>Check if your exam is accepted by the colleges you're interested in</li>
        </ul>
        <button class="btn-primary" onclick="newSearch()">Modify Your Preferences</button>
      </div>
    `;
  }

  // Render the list (cards or empty state) into the results-list container
  renderResultsList(list) {
    const listContainer = this.container.querySelector('#results-list');
    if (!listContainer) {
      // Fallback for safety: render directly into main container if needed
      this.container.innerHTML += this.generateCollegeCards(list);
      return;
    }

    const hasResults = list && list.length > 0;
    listContainer.innerHTML = hasResults
      ? this.generateCollegeCards(list)
      : this.generateNoResultsHTML();

    // Re-sync compare button states when list changes
    this.syncCompareButtons();
  }

  // Get color based on match percentage
  getMatchColor(percentage) {
    if (percentage >= 85) return '#10b981'; // Green
    if (percentage >= 70) return '#3b82f6'; // Blue
    if (percentage >= 55) return '#f59e0b'; // Orange
    return '#ef4444'; // Red
  }

  // Format college type for display
  formatCollegeType(type) {
    const typeMap = {
      'government': '🏛️ Government',
      'private-autonomous': '🏫 Private Autonomous',
      'private-jntuh-ou': '🏫 Private (Affiliated)'
    };
    return typeMap[type] || type;
  }

  // Format facility name for display
  formatFacilityName(facility) {
    const facilityMap = {
      'gym': '💪 Gym',
      'swimming-pool': '🏊 Swimming Pool',
      'playground': '⚽ Playground',
      'indoor-games': '🎮 Indoor Games',
      'library': '📚 Library',
      'clubs': '🎭 Clubs'
    };
    return facilityMap[facility] || facility;
  }

  // Format OC CSE cutoff for quick display on card
  formatOcCseCutoff(college) {
    const ocCutoff =
      college.cutoffRanks &&
      college.cutoffRanks.OC &&
      college.cutoffRanks.OC.CSE;
    if (!ocCutoff) return "N/A";
    return `~${ocCutoff}`;
  }

  // Show detailed view for a college
  showCollegeDetails(collegeId) {
    const college = this.currentResults.find(c => c.id === collegeId);
    if (!college) return;

    const modal = document.createElement('div');
    modal.className = 'college-modal';
    modal.innerHTML = `
      <div class="modal-content">
        <div class="modal-header">
          <h2>${college.name}</h2>
          <button class="modal-close" onclick="closeModal()">&times;</button>
        </div>
        <div class="modal-body">
          <div class="college-overview">
            <div class="overview-item">
              <h3>📍 Location</h3>
              <p>${college.location}</p>
            </div>
            <div class="overview-item">
              <h3>🏛️ Type</h3>
              <p>${this.formatCollegeType(college.type)}</p>
            </div>
            <div class="overview-item">
              <h3>⭐ NAAC Grade</h3>
              <p>${college.naacGrade}</p>
            </div>
            <div class="overview-item">
              <h3>💰 Average Package</h3>
              <p>₹${college.avgPackage.toLocaleString()} per year</p>
            </div>
          </div>
          
          <div class="cutoff-info">
            <h3>📊 Cutoff Ranks (Previous Year)</h3>
            <table class="cutoff-table">
              <thead>
                <tr>
                  <th>Category</th>
                  <th>CSE</th>
                  <th>ECE</th>
                  <th>Mechanical</th>
                </tr>
              </thead>
              <tbody>
                ${Object.entries(college.cutoffRanks).map(([category, ranks]) => `
                  <tr>
                    <td>${category}</td>
                    <td>${ranks.CSE || '-'}</td>
                    <td>${ranks.ECE || '-'}</td>
                    <td>${ranks.Mechanical || '-'}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
          
          <div class="fee-info">
            <h3>💸 Fee Structure (per year)</h3>
            <table class="fee-table">
              <thead>
                <tr>
                  <th>Category</th>
                  <th>Fee</th>
                </tr>
              </thead>
              <tbody>
                ${Object.entries(college.fees).map(([category, fee]) => `
                  <tr>
                    <td>${category}</td>
                    <td>₹${fee.toLocaleString()}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
          
          <div class="campus-life">
            <h3>🎓 Campus Life</h3>
            <div class="campus-grid">
              <div class="campus-item">
                <strong>Hostel:</strong> ${college.hostelAvailable ? 'Available' : 'Not Available'}
              </div>
              <div class="campus-item">
                <strong>Area:</strong> ${college.urban ? 'Urban' : 'Rural'}
              </div>
              <div class="campus-item">
                <strong>Fest Frequency:</strong> ${college.festFrequency}
              </div>
              <div class="campus-item">
                <strong>Dual Degree:</strong> ${college.dualDegree ? 'Available' : 'Not Available'}
              </div>
              <div class="campus-item">
                <strong>Scholarships:</strong> ${college.scholarshipAvailable ? 'Available' : 'Not Available'}
              </div>
              <div class="campus-item">
                <strong>Transport:</strong> ${college.transportConnectivity}
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(modal);
    modal.style.display = 'flex';
  }

  // Attach event listeners
  attachEventListeners() {
    const searchInput = this.container.querySelector('#results-search-input');
    if (searchInput) {
      searchInput.addEventListener('input', (event) => {
        const query = (event.target.value || '').toLowerCase().trim();

        if (!query) {
          this.filteredResults = this.currentResults;
        } else {
          this.filteredResults = this.currentResults.filter((college) => {
            const haystack = [
              college.name,
              college.shortName,
              college.location,
              this.formatCollegeType(college.type),
              college.naacGrade,
              (college.facilities || []).join(' '),
              (college.matchReasons || []).join(' '),
              // include branch names from suggestedBranches so queries like "CSE" work better
              (college.suggestedBranches || [])
                .map((b) => b.branch)
                .join(' '),
            ]
              .join(' ')
              .toLowerCase();

            return haystack.includes(query);
          });
        }

        this.renderResultsList(this.filteredResults);
      });
    }
  }

  // ===== Compare functionality =====

  toggleCompare(collegeId) {
    const id = Number(collegeId);
    const index = this.selectedForCompare.indexOf(id);

    if (index !== -1) {
      this.selectedForCompare.splice(index, 1);
    } else {
      if (this.selectedForCompare.length >= 3) {
        alert("You can compare up to 3 colleges at a time.");
        return;
      }
      this.selectedForCompare.push(id);
    }

    this.syncCompareButtons();
    this.updateCompareBar();

    // If there are at least two selected, immediately show the comparison
    if (this.selectedForCompare.length >= 2) {
      this.showCompareModal();
    }
  }

  syncCompareButtons() {
    const buttons = this.container.querySelectorAll('.compare-btn');
    buttons.forEach((btn) => {
      const id = Number(btn.getAttribute('data-compare-id'));
      const selected = this.selectedForCompare.includes(id);
      btn.textContent = selected ? 'Added' : 'Add to Compare';
      btn.classList.toggle('compare-btn--active', selected);
    });
  }

  updateCompareBar() {
    const bar = this.container.querySelector('#compare-bar');
    if (!bar) return;

    if (this.selectedForCompare.length === 0) {
      bar.classList.add('is-hidden');
      bar.innerHTML = '';
      return;
    }

    const items = this.selectedForCompare
      .map((id) => this.currentResults.find((c) => c.id === id))
      .filter(Boolean);

    const chipsHtml = items
      .map(
        (c) => `
      <div class="compare-chip">
        <span>${c.shortName || c.name}</span>
        <button
          type="button"
          class="compare-chip-remove"
          data-remove-id="${c.id}"
        >
          ×
        </button>
      </div>
    `
      )
      .join('');

    bar.innerHTML = `
      <div class="compare-bar-left">
        <span class="compare-label">Compare:</span>
        <div class="compare-chip-row">
          ${chipsHtml}
        </div>
      </div>
      <button type="button" class="btn-primary btn-small" id="compare-now-btn">
        Compare now (${this.selectedForCompare.length})
      </button>
    `;

    bar.classList.remove('is-hidden');

    // Wire up remove buttons and compare button
    bar.querySelectorAll('.compare-chip-remove').forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = Number(btn.getAttribute('data-remove-id'));
        this.toggleCompare(id);
      });
    });

    const compareNowBtn = bar.querySelector('#compare-now-btn');
    if (compareNowBtn) {
      compareNowBtn.addEventListener('click', () => this.showCompareModal());
    }
  }

  showCompareModal() {
    if (!this.selectedForCompare.length) return;

    const items = this.selectedForCompare
      .map((id) => this.currentResults.find((c) => c.id === id))
      .filter(Boolean);
    if (items.length < 2) {
      alert('Select at least two colleges to compare.');
      return;
    }

    const modal = document.createElement('div');
    modal.className = 'college-modal';

    const params = [
      { key: 'Location', fn: (c) => c.location || 'Data not available' },
      { key: 'College Type', fn: (c) => this.formatCollegeType(c.type) || 'Data not available' },
      { key: 'NAAC Grade', fn: (c) => c.naacGrade || 'Data not available' },
      { key: 'Entrance Exams', fn: (c) => (c.entranceExams && c.entranceExams.length) ? c.entranceExams.join(', ') : 'Data not available' },
      { key: 'Annual Fee (OC)', fn: (c) => {
        const fee = c.fees && (c.fees.OC || c.fees[Object.keys(c.fees)[0]]);
        return fee != null ? '₹' + Number(fee).toLocaleString() : 'Data not available';
      }},
      { key: 'Average Package', fn: (c) => c.avgPackage != null ? '₹' + c.avgPackage.toLocaleString() : 'Data not available' },
      { key: 'Hostel Availability', fn: (c) => c.hostelAvailable === true ? 'Available' : c.hostelAvailable === false ? 'Not available' : 'Data not available' },
      { key: 'Urban/Rural', fn: (c) => c.urban === true ? 'Urban' : c.urban === false ? 'Rural' : 'Data not available' },
      { key: 'Key Facilities', fn: (c) => (c.facilities && c.facilities.length) ? c.facilities.join(', ') : 'Data not available' },
    ];

    const tableRows = params
      .map(
        (p) => `
        <tr>
          <td class="compare-param">${p.key}</td>
          ${items.map((c) => `<td>${p.fn(c)}</td>`).join('')}
        </tr>
      `
      )
      .join('');

    const headerCells = items
      .map((c) => `<th>${c.shortName || c.name}</th>`)
      .join('');

    const naacOrder = ['A++', 'A+', 'A', 'B++', 'B+', 'B'];
    const bestNaac = items.reduce((best, c) => {
      const idx = naacOrder.indexOf(c.naacGrade);
      if (idx === -1) return best;
      if (best === null) return c;
      return idx < naacOrder.indexOf(best.naacGrade) ? c : best;
    }, null);

    const bestPkg = items.reduce((best, c) =>
      (c.avgPackage != null && (best == null || c.avgPackage > best.avgPackage)) ? c : best
    , null);

    const lowestFee = items.reduce((low, c) => {
      const fee = c.fees && (c.fees.OC || c.fees[Object.keys(c.fees)[0]]);
      return fee != null && (low == null || fee < low.fee) ? { c, fee } : low;
    }, null);

    let summary = 'Summary: ';
    const parts = [];
    items.forEach((c) => {
      const strengths = [];
      if (c.naacGrade) strengths.push(`NAAC ${c.naacGrade}`);
      if (c.avgPackage) strengths.push(`avg package ₹${c.avgPackage.toLocaleString()}`);
      if (c.hostelAvailable) strengths.push('hostel available');
      if (strengths.length) parts.push(`${c.shortName || c.name}: ${strengths.join(', ')}.`);
    });
    summary += parts.join(' ');

    if (bestNaac) summary += ` Highest NAAC Grade: ${bestNaac.shortName || bestNaac.name} (${bestNaac.naacGrade}).`;
    if (bestPkg) summary += ` Highest Average Package: ${bestPkg.shortName || bestPkg.name} (₹${bestPkg.avgPackage.toLocaleString()}).`;
    if (lowestFee) summary += ` Lowest Annual Fee: ${lowestFee.c.shortName || lowestFee.c.name} (₹${lowestFee.fee.toLocaleString()}).`;

    modal.innerHTML = `
      <div class="modal-content compare-modal-content">
        <div class="modal-header">
          <h2>College Comparison</h2>
          <button class="modal-close" onclick="closeModal()">&times;</button>
        </div>
        <div class="modal-body compare-modal-body">
          <table class="compare-table">
            <thead>
              <tr>
                <th class="compare-param">Parameter</th>
                ${headerCells}
              </tr>
            </thead>
            <tbody>
              ${tableRows}
            </tbody>
          </table>
          <div class="compare-summary">
            <h4>Summary</h4>
            <p>${summary}</p>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(modal);
    modal.style.display = 'flex';
  }
}

// Global functions for onclick handlers
function viewCollegeDetails(collegeId) {
  if (window.resultsDisplay) {
    window.resultsDisplay.showCollegeDetails(collegeId);
  }
}

function addToCompare(collegeId) {
  if (window.resultsDisplay) {
    window.resultsDisplay.toggleCompare(collegeId);
  }
}

function closeModal() {
  const modal = document.querySelector('.college-modal');
  if (modal) {
    modal.remove();
  }
}

function newSearch() {
  // Hide results and reset form
  const resultsContainer = document.getElementById('results-container');
  if (resultsContainer) {
    resultsContainer.innerHTML = '';
    resultsContainer.style.display = 'block';
  }
  
  // Reset to first step
  if (window.showStep) {
    window.showStep(1);
  }
  
  // Scroll to top
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ResultsDisplay;
}
