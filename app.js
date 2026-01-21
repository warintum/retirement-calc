// =================================
// State Management
// =================================
const state = {
  workStartYear: 0,
  currentSalary: 0,
  bonusRate: 0,
  salaryIncreaseRate: 0,
  providentFundRate: 0,
  currentAge: 0,
  existingProvidentFund: 0,
  fundReturnRate: 1, // Default 1%
  retirementAge: 60,
  currentYear: new Date().getFullYear() // ไม่ hardcode ปีปัจจุบัน
};

// =================================
// localStorage Functions
// =================================
const STORAGE_KEY = 'retirementCalcData';

function saveToLocalStorage() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    console.log('✅ บันทึกข้อมูลสำเร็จ');
  } catch (error) {
    console.error('❌ เกิดข้อผิดพลาดในการบันทึกข้อมูล:', error);
  }
}

function loadFromLocalStorage() {
  try {
    const savedData = localStorage.getItem(STORAGE_KEY);
    if (savedData) {
      const parsedData = JSON.parse(savedData);
      // Update state with saved data
      Object.assign(state, parsedData);
      // Update current year (always use current year)
      state.currentYear = new Date().getFullYear();
      console.log('✅ โหลดข้อมูลสำเร็จ');
      return true;
    }
    return false;
  } catch (error) {
    console.error('❌ เกิดข้อผิดพลาดในการโหลดข้อมูล:', error);
    return false;
  }
}

function clearLocalStorage() {
  try {
    localStorage.removeItem(STORAGE_KEY);
    console.log('✅ เคลียร์ข้อมูลสำเร็จ');
  } catch (error) {
    console.error('❌ เกิดข้อผิดพลาดในการเคลียร์ข้อมูล:', error);
  }
}

// =================================
// Calculation Engine
// =================================
function calculateRetirement() {
  const yearsWorked = state.currentYear - state.workStartYear;
  const yearsUntilRetirement = state.retirementAge - state.currentAge;
  const totalWorkYears = yearsWorked + yearsUntilRetirement;

  const salaryIncreaseDecimal = state.salaryIncreaseRate / 100;
  const providentFundDecimal = state.providentFundRate / 100;
  const totalProvidentFundRate = providentFundDecimal * 2; // พนักงาน + นายจ้าง
  const fundReturnRateDecimal = state.fundReturnRate / 100; // ใช้ค่าที่ผู้ใช้กรอก

  const salaryAt60 = Math.round(
    state.currentSalary * Math.pow(1 + salaryIncreaseDecimal, yearsUntilRetirement)
  );

  // คำนวณโบนัสแต่ละปี (ใช้ฐานเงินเดือนปีก่อน)
  const bonusByYear = [];
  let previousYearSalary = state.currentSalary; // เงินเดือนปีก่อน = เงินเดือนปัจจุบัน (สำหรับปีแรก)
  let currentYearSalary = state.currentSalary;

  for (let year = 0; year < yearsUntilRetirement; year++) {
    // โบนัสคำนวณจากเงินเดือนปีก่อน
    const bonus = Math.round(previousYearSalary * state.bonusRate);
    bonusByYear.push({
      year: state.currentYear + year,
      salary: Math.round(currentYearSalary), // เงินเดือนปีปัจจุบัน
      baseSalary: Math.round(previousYearSalary), // ฐานเงินเดือนที่ใช้คำนวณโบนัส (ปีก่อน)
      bonus: bonus
    });
    // เตรียมสำหรับปีถัดไป
    previousYearSalary = currentYearSalary; // เงินเดือนปีนี้จะเป็นฐานโบนัสปีหน้า
    currentYearSalary *= (1 + salaryIncreaseDecimal); // เงินเดือนปีหน้า
  }

  // คำนวณกองทุนสำรองเลี้ยงชีพ (เฉพาะที่จะออมในอนาคต)
  let futureProvidentFund = 0;
  let currentSalaryForPF = state.currentSalary;

  for (let year = 0; year < yearsUntilRetirement; year++) {
    const yearlyContribution = currentSalaryForPF * 12 * totalProvidentFundRate;
    const yearsRemaining = yearsUntilRetirement - year;
    const futureValue = yearlyContribution * Math.pow(1 + fundReturnRateDecimal, yearsRemaining);
    futureProvidentFund += futureValue;
    currentSalaryForPF *= (1 + salaryIncreaseDecimal);
  }

  // รวมเงินกองทุนทั้งหมด
  const existingFundAtRetirement = state.existingProvidentFund;
  const totalProvidentFund = existingFundAtRetirement + futureProvidentFund;

  // คำนวณเงินเกษียณอายุ
  const retirement1 = (salaryAt60 * 400) / 30;
  const retirement2 = (salaryAt60 * totalWorkYears) / 2;
  const retirementBenefit = Math.max(retirement1, retirement2);

  // รวมเงินทั้งหมด
  const totalMoney = retirementBenefit + totalProvidentFund;

  return {
    yearsWorked,
    yearsUntilRetirement,
    totalWorkYears,
    salaryAt60,
    bonusByYear,
    futureProvidentFund,
    existingFundAtRetirement,
    totalProvidentFund,
    retirement1,
    retirement2,
    retirementBenefit,
    totalMoney
  };
}

// =================================
// UI Rendering Functions
// =================================
function formatNumber(num) {
  return Math.round(num).toLocaleString('th-TH');
}

function renderBasicInfo(data) {
  const container = document.getElementById('basicInfoGrid');
  container.innerHTML = `
    <div class="info-card blue">
      <p class="info-card-label">ทำงานมาแล้ว</p>
      <p class="info-card-value">${data.yearsWorked}</p>
      <p class="info-card-unit">ปี</p>
    </div>
    <div class="info-card orange">
      <p class="info-card-label">เหลือจนเกษียณ</p>
      <p class="info-card-value">${data.yearsUntilRetirement}</p>
      <p class="info-card-unit">ปี</p>
    </div>
    <div class="info-card green">
      <p class="info-card-label">รวมอายุงาน</p>
      <p class="info-card-value">${data.totalWorkYears}</p>
      <p class="info-card-unit">ปี</p>
    </div>
    <div class="info-card purple">
      <p class="info-card-label">เงินเดือนตอนเกษียณ</p>
      <p class="info-card-value">${formatNumber(data.salaryAt60)}</p>
      <p class="info-card-unit">บาท</p>
    </div>
  `;
}

function renderStatsCards(data) {
  const container = document.getElementById('statsGrid');
  container.innerHTML = `
    <div class="stat-card" style="background: linear-gradient(135deg, #818cf8 0%, #6366f1 100%);">
      <div class="stat-card-header">
        <div>
          <p class="stat-card-title">เงินกองทุนเดิม (ปัจจุบัน)</p>
          <p class="stat-card-value">${formatNumber(data.existingFundAtRetirement)} ฿</p>
          <p class="stat-card-subtitle">รวมดอกเบี้ยแล้ว</p>
        </div>
        <i data-lucide="piggy-bank" class="stat-card-icon"></i>
      </div>
    </div>
    
    <div class="stat-card" style="background: linear-gradient(135deg, #a78bfa 0%, #8b5cf6 100%);">
      <div class="stat-card-header">
        <div>
          <p class="stat-card-title">เงินกองทุนใหม่ (อนาคต)</p>
          <p class="stat-card-value">${formatNumber(data.futureProvidentFund)} ฿</p>
          <p class="stat-card-subtitle">${state.providentFundRate}% + ${state.providentFundRate}% (นายจ้าง) + ผลตอบแทน ${state.fundReturnRate}%</p>
        </div>
        <i data-lucide="trending-up" class="stat-card-icon"></i>
      </div>
    </div>
    
    <div class="stat-card" style="background: linear-gradient(135deg, #f87171 0%, #ef4444 100%);">
      <div class="stat-card-header">
        <div>
          <p class="stat-card-title">เงินเกษียณอายุ</p>
          <p class="stat-card-value">${formatNumber(data.retirementBenefit)} ฿</p>
          <p class="stat-card-subtitle">${data.retirement2 > data.retirement1 ? 'ใช้สูตรที่ 2' : 'ใช้สูตรที่ 1'}</p>
        </div>
        <i data-lucide="trophy" class="stat-card-icon"></i>
      </div>
    </div>
    
    <div class="stat-card" style="background: linear-gradient(135deg, #4ade80 0%, #22c55e 100%);">
      <div class="stat-card-header">
        <div>
          <p class="stat-card-title">รวมเงินทั้งหมดที่จะได้รับ</p>
          <p class="stat-card-value">${formatNumber(data.totalMoney)} ฿</p>
          <p class="stat-card-subtitle">เกษียณอายุ + กองทุนรวม</p>
        </div>
        <i data-lucide="dollar-sign" class="stat-card-icon"></i>
      </div>
    </div>
  `;
  lucide.createIcons();
}

function renderBonusList(data) {
  const container = document.getElementById('bonusList');
  if (data.bonusByYear.length === 0) {
    container.innerHTML = '<p style="text-align: center; color: var(--color-gray-400);">ไม่มีข้อมูลโบนัส</p>';
    return;
  }

  const html = data.bonusByYear.map(item => `
    <div class="bonus-item">
      <div class="bonus-item-left">
        <span class="bonus-item-year">ปี ${item.year}</span>
        <span class="bonus-item-salary">เงินเดือน ${formatNumber(item.salary)} ฿ (ฐาน: ${formatNumber(item.baseSalary)} ฿)</span>
      </div>
      <div class="bonus-item-right">
        <span class="bonus-item-value">${formatNumber(item.bonus)} ฿</span>
        <span class="bonus-item-rate">${state.bonusRate} เท่า</span>
      </div>
    </div>
  `).join('');

  container.innerHTML = html;
}

function renderRetirementFormulas(data) {
  const container = document.getElementById('formulasList');
  const formula1Selected = data.retirement1 >= data.retirement2;
  const formula2Selected = data.retirement2 > data.retirement1;

  container.innerHTML = `
    <div class="formula-item ${formula1Selected ? 'selected' : ''}">
      <p class="formula-title">
        สูตรที่ 1: เงินเดือน × 400 ÷ 30
        ${formula1Selected ? '⭐' : ''}
      </p>
      <p class="formula-calculation">
        ${formatNumber(data.salaryAt60)} × 400 ÷ 30 = ${formatNumber(data.retirement1)} ฿
      </p>
      ${formula1Selected ? '<p class="formula-note">✅ ใช้สูตรนี้เพราะให้ผลมากกว่า</p>' : ''}
    </div>
    
    <div class="formula-item ${formula2Selected ? 'selected' : ''}">
      <p class="formula-title">
        สูตรที่ 2: เงินเดือน × อายุงาน ÷ 2
        ${formula2Selected ? '⭐' : ''}
      </p>
      <p class="formula-calculation">
        ${formatNumber(data.salaryAt60)} × ${data.totalWorkYears} ÷ 2 = ${formatNumber(data.retirement2)} ฿
      </p>
      ${formula2Selected ? '<p class="formula-note">✅ ใช้สูตรนี้เพราะให้ผลมากกว่า</p>' : ''}
    </div>
  `;
}

function renderSummary(data) {
  const container = document.getElementById('summarySection');
  container.innerHTML = `
    <i data-lucide="dollar-sign" class="summary-icon"></i>
    <h2 class="summary-title">รวมเงินทั้งหมดที่จะได้รับ</h2>
    <p class="summary-value">${formatNumber(data.totalMoney)} ฿</p>
    <div class="summary-details">
      <p>เงินเกษียณอายุ: ${formatNumber(data.retirementBenefit)} ฿</p>
      <p>เงินกองทุนรวม: ${formatNumber(data.totalProvidentFund)} ฿</p>
      <div class="summary-breakdown">
        <p>• เงินกองทุนเดิม: ${formatNumber(data.existingFundAtRetirement)} ฿</p>
        <p>• เงินกองทุนใหม่: ${formatNumber(data.futureProvidentFund)} ฿</p>
      </div>
    </div>
    <p class="summary-note">* ไม่รวมโบนัสเพราะเป็นรายได้ระหว่างทำงาน</p>
  `;
  lucide.createIcons();
}

function updateUI() {
  const data = calculateRetirement();

  // Show/hide sections
  document.getElementById('resultsContainer').style.display = 'block';
  document.getElementById('emptyState').style.display = 'none';

  // Render all sections
  renderBasicInfo(data);
  renderStatsCards(data);
  renderBonusList(data);
  renderRetirementFormulas(data);
  renderSummary(data);
}

// =================================
// Event Handlers
// =================================
function updateStateFromInputs() {
  state.workStartYear = Number(document.getElementById('workStartYear').value) || 0;
  state.currentAge = Number(document.getElementById('currentAge').value) || 0;
  state.currentSalary = Number(document.getElementById('currentSalary').value) || 0;
  state.bonusRate = Number(document.getElementById('bonusRate').value) || 0;
  state.salaryIncreaseRate = Number(document.getElementById('salaryIncreaseRate').value) || 0;
  state.providentFundRate = Number(document.getElementById('providentFundRate').value) || 0;
  state.fundReturnRate = Number(document.getElementById('fundReturnRate').value) || 1;
  state.existingProvidentFund = Number(document.getElementById('existingProvidentFund').value) || 0;

  saveToLocalStorage();
}

function loadStateToInputs() {
  document.getElementById('workStartYear').value = state.workStartYear || '';
  document.getElementById('currentAge').value = state.currentAge || '';
  document.getElementById('currentSalary').value = state.currentSalary || '';
  document.getElementById('bonusRate').value = state.bonusRate || '';
  document.getElementById('salaryIncreaseRate').value = state.salaryIncreaseRate || '';
  document.getElementById('providentFundRate').value = state.providentFundRate || '';
  document.getElementById('fundReturnRate').value = state.fundReturnRate || 1;
  document.getElementById('existingProvidentFund').value = state.existingProvidentFund || '';
}

function handleCalculate() {
  updateStateFromInputs();

  // Validate inputs
  if (state.workStartYear === 0 || state.currentAge === 0 || state.currentSalary === 0) {
    alert('⚠️ กรุณากรอกข้อมูลที่จำเป็น: ปีเริ่มงาน, อายุปัจจุบัน, และเงินเดือน');
    return;
  }

  if (state.workStartYear > state.currentYear) {
    alert('⚠️ ปีเริ่มงานต้องไม่มากกว่าปีปัจจุบัน');
    return;
  }

  if (state.currentAge >= state.retirementAge) {
    alert('⚠️ อายุปัจจุบันต้องน้อยกว่าอายุเกษียณ (60 ปี)');
    return;
  }

  updateUI();
}

function handleClear() {
  // Show confirmation modal
  const modal = document.getElementById('confirmModal');
  modal.classList.add('show');
}

function confirmClear() {
  // Clear state
  Object.keys(state).forEach(key => {
    if (key !== 'retirementAge' && key !== 'currentYear') {
      state[key] = key === 'fundReturnRate' ? 1 : 0;
    }
  });

  // Clear localStorage
  clearLocalStorage();

  // Clear inputs
  loadStateToInputs();

  // Hide results
  document.getElementById('resultsContainer').style.display = 'none';
  document.getElementById('emptyState').style.display = 'block';

  // Hide modal
  document.getElementById('confirmModal').classList.remove('show');
}

function cancelClear() {
  document.getElementById('confirmModal').classList.remove('show');
}

// =================================
// Input Auto-save
// =================================
function setupAutoSave() {
  const inputs = [
    'workStartYear',
    'currentAge',
    'currentSalary',
    'bonusRate',
    'salaryIncreaseRate',
    'providentFundRate',
    'fundReturnRate',
    'existingProvidentFund'
  ];

  inputs.forEach(id => {
    const input = document.getElementById(id);
    input.addEventListener('input', () => {
      updateStateFromInputs();
    });
  });
}

// =================================
// Initialization
// =================================
function init() {
  console.log('🚀 Initializing Retirement Calculator...');
  console.log('📅 ปีปัจจุบัน:', state.currentYear);

  // Load data from localStorage
  const hasData = loadFromLocalStorage();

  if (hasData) {
    console.log('📦 พบข้อมูลที่บันทึกไว้');
    loadStateToInputs();
    // Auto-calculate if there's saved data
    if (state.workStartYear > 0 && state.currentAge > 0 && state.currentSalary > 0) {
      updateUI();
    }
  } else {
    console.log('📝 ไม่พบข้อมูลที่บันทึกไว้');
  }

  // Setup event listeners
  document.getElementById('calculateBtn').addEventListener('click', handleCalculate);
  document.getElementById('clearBtn').addEventListener('click', handleClear);
  document.getElementById('confirmYes').addEventListener('click', confirmClear);
  document.getElementById('confirmNo').addEventListener('click', cancelClear);

  // Setup auto-save
  setupAutoSave();

  // Close modal on backdrop click
  document.getElementById('confirmModal').addEventListener('click', (e) => {
    if (e.target.id === 'confirmModal') {
      cancelClear();
    }
  });

  console.log('✅ Initialization complete!');
}

// Start the app when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
