import React, { useState, useEffect } from 'react';
import { TrendingUp, DollarSign, Gift, PiggyBank, Trophy, Calendar, Calculator, Settings } from 'lucide-react';

const RetirementDashboard = () => {
  const [workStartYear, setWorkStartYear] = useState(0);
  const [currentSalary, setCurrentSalary] = useState(0);
  const [bonusRate, setBonusRate] = useState(0);
  const [salaryIncreaseRate, setSalaryIncreaseRate] = useState(0);
  const [providentFundRate, setProvidentFundRate] = useState(0);
  const [currentAge, setCurrentAge] = useState(0);
  const [existingProvidentFund, setExistingProvidentFund] = useState(0);
  const [retirementAge] = useState(60);
  const [currentYear] = useState(2025);
  
  // State สำหรับการแสดงผล
  const [calculatedData, setCalculatedData] = useState(null);
  
  // ฟังก์ชันคำนวณ
  const calculateRetirement = () => {
    // คำนวณข้อมูล
    const yearsWorked = currentYear - workStartYear;
    const yearsUntilRetirement = retirementAge - currentAge;
    const totalWorkYears = yearsWorked + yearsUntilRetirement;
    const salaryIncreaseDecimal = salaryIncreaseRate / 100;
    const providentFundDecimal = providentFundRate / 100;
    const totalProvidentFundRate = providentFundDecimal * 2; // พนักงาน + นายจ้าง (เท่ากัน)
    const salaryAt60 = Math.round(currentSalary * Math.pow(1 + salaryIncreaseDecimal, yearsUntilRetirement));
    
    // คำนวณโบนัสแต่ละปี
    const bonusByYear = [];
    let tempSalary = currentSalary;
    for (let year = 0; year < yearsUntilRetirement; year++) {
      const bonus = Math.round(tempSalary * bonusRate);
      bonusByYear.push({
        year: currentYear + year,
        salary: Math.round(tempSalary),
        bonus: bonus
      });
      tempSalary *= (1 + salaryIncreaseDecimal);
    }
    
    // คำนวณกองทุนสำรองเลี้ยงชีพ (เฉพาะที่จะออมในอนาคต)
    let futureProvidentFund = 0;
    let currentSalaryForPF = currentSalary;
    const fundReturnRate = 0.01; // 1% ต่อปี
    
    for (let year = 0; year < yearsUntilRetirement; year++) {
      const yearlyContribution = currentSalaryForPF * 12 * totalProvidentFundRate;
      const yearsRemaining = yearsUntilRetirement - year;
      const futureValue = yearlyContribution * Math.pow(1 + fundReturnRate, yearsRemaining);
      futureProvidentFund += futureValue;
      currentSalaryForPF *= (1 + salaryIncreaseDecimal);
    }
    
    // รวมเงินกองทุนทั้งหมด (เงินเก่า + เงินใหม่ที่จะออม)
    // เงินกองทุนเดิมรวมดอกเบี้ยแล้ว ไม่ต้องคำนวณดอกเบี้ยเพิ่ม
    const existingFundAtRetirement = existingProvidentFund;
    const totalProvidentFund = existingFundAtRetirement + futureProvidentFund;
    
    // คำนวณเงินเกษียณอายุ
    const retirement1 = (salaryAt60 * 400) / 30;
    const retirement2 = (salaryAt60 * totalWorkYears) / 2;
    const retirementBenefit = Math.max(retirement1, retirement2);
    
    // รวมเงินทั้งหมด = เงินเกษียณ + กองทุน (ไม่รวมโบนัส)
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
      totalMoney,
      providentFundRate
    };
  };

  // คำนวณครั้งแรกเมื่อโหลด component
  useEffect(() => {
    setCalculatedData(calculateRetirement());
  }, []);
  
  // ถ้ายังไม่มีข้อมูลการคำนวณ ให้แสดง loading
  if (!calculatedData) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-xl">กำลังคำนวณ...</div>
      </div>
    );
  }
  
  const {
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
  } = calculatedData;

  const StatCard = ({ title, value, icon: Icon, color, subtitle }) => (
    <div className={`bg-gradient-to-br ${color} rounded-xl p-6 text-white shadow-lg transform hover:scale-105 transition-all duration-300`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-white/80 text-sm font-medium">{title}</p>
          <p className="text-2xl font-bold mt-1">{value}</p>
          {subtitle && <p className="text-white/70 text-xs mt-1">{subtitle}</p>}
        </div>
        <Icon className="h-8 w-8 text-white/80" />
      </div>
    </div>
  );

  const InputField = ({ label, value, onChange, type = "number", suffix = "" }) => {
    const handleChange = (e) => {
      const newValue = e.target.value;
      if (type === "number") {
        // อนุญาตให้พิมพ์ได้ต่อเนื่อง โดยไม่แปลงเป็น Number ทันที
        if (newValue === "" || newValue === "0") {
          onChange(0);
        } else {
          const numValue = parseFloat(newValue);
          if (!isNaN(numValue)) {
            onChange(numValue);
          }
        }
      } else {
        onChange(newValue);
      }
    };

    return (
      <div className="space-y-1">
        <label className="block text-sm font-medium text-gray-700">{label}</label>
        <div className="relative">
          <input
            type="text"
            value={value}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="0"
          />
          {suffix && <span className="absolute right-3 top-2 text-gray-500 text-sm">{suffix}</span>}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2 flex items-center justify-center gap-3">
            <Calculator className="text-blue-600" />
            แผนการเงินเกษียณอายุ
          </h1>
          <p className="text-gray-600 text-lg">คำนวณและวิเคราะห์การเงินส่วนบุคคล</p>
        </div>

        {/* Input Panel */}
        <div className="bg-white rounded-2xl p-6 shadow-lg mb-8">
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Settings className="text-blue-600" />
            ตั้งค่าข้อมูล
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-3">
            <InputField
              label="ปีเริ่มงาน"
              value={workStartYear}
              onChange={setWorkStartYear}
            />
            <InputField
              label="อายุปัจจุบัน"
              value={currentAge}
              onChange={setCurrentAge}
              suffix="ปี"
            />
            <InputField
              label="เงินเดือน"
              value={currentSalary}
              onChange={setCurrentSalary}
              suffix="฿"
            />
            <InputField
              label="โบนัส"
              value={bonusRate}
              onChange={setBonusRate}
              suffix="เท่า"
            />
            <InputField
              label="ขึ้นเงินเดือน"
              value={salaryIncreaseRate}
              onChange={setSalaryIncreaseRate}
              suffix="%"
            />
            <InputField
              label="หักกองทุน"
              value={providentFundRate}
              onChange={setProvidentFundRate}
              suffix="%"
            />
            <InputField
              label="เงินกองทุนปัจจุบัน"
              value={existingProvidentFund}
              onChange={setExistingProvidentFund}
              suffix="฿"
            />
          </div>
          <div className="mt-4 text-center">
            <button
              onClick={() => setCalculatedData(calculateRetirement())}
              className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-3 rounded-lg font-medium hover:from-blue-600 hover:to-purple-700 transform hover:scale-105 transition-all duration-200 shadow-lg"
            >
              🧮 คำนวณใหม่
            </button>
          </div>
        </div>

        {/* ข้อมูลพื้นฐาน */}
        <div className="bg-white rounded-2xl p-6 shadow-lg mb-8">
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Calendar className="text-purple-600" />
            ข้อมูลพื้นฐาน
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center bg-blue-50 rounded-lg p-4">
              <p className="text-gray-600 font-medium">ทำงานมาแล้ว</p>
              <p className="text-2xl font-bold text-blue-600">{yearsWorked}</p>
              <p className="text-sm text-gray-500">ปี</p>
            </div>
            <div className="text-center bg-orange-50 rounded-lg p-4">
              <p className="text-gray-600 font-medium">เหลือจนเกษียณ</p>
              <p className="text-2xl font-bold text-orange-600">{yearsUntilRetirement}</p>
              <p className="text-sm text-gray-500">ปี</p>
            </div>
            <div className="text-center bg-green-50 rounded-lg p-4">
              <p className="text-gray-600 font-medium">รวมอายุงาน</p>
              <p className="text-2xl font-bold text-green-600">{totalWorkYears}</p>
              <p className="text-sm text-gray-500">ปี</p>
            </div>
            <div className="text-center bg-purple-50 rounded-lg p-4">
              <p className="text-gray-600 font-medium">เงินเดือนตอนเกษียณ</p>
              <p className="text-2xl font-bold text-purple-600">{salaryAt60.toLocaleString()}</p>
              <p className="text-sm text-gray-500">บาท</p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="เงินกองทุนเดิม (ปัจจุบัน)"
            value={`${existingFundAtRetirement.toLocaleString()}฿`}
            icon={PiggyBank}
            color="from-indigo-500 to-indigo-700"
            subtitle={`รวมดอกเบี้ยแล้ว`}
          />
          <StatCard
            title="เงินกองทุนใหม่ (อนาคต)"
            value={`${Math.round(futureProvidentFund).toLocaleString()}฿`}
            icon={PiggyBank}
            color="from-purple-500 to-purple-700"
            subtitle={`${providentFundRate}% + ${providentFundRate}% (นายจ้าง) + ผลตอบแทน 1%`}
          />
          <StatCard
            title="เงินเกษียณอายุ"
            value={`${Math.round(retirementBenefit).toLocaleString()}฿`}
            icon={Trophy}
            color="from-red-500 to-red-700"
            subtitle={retirement2 > retirement1 ? "ใช้สูตรที่ 2" : "ใช้สูตรที่ 1"}
          />
          <StatCard
            title="รวมเงินทั้งหมดที่จะได้รับ"
            value={`${Math.round(totalMoney).toLocaleString()}฿`}
            icon={DollarSign}
            color="from-green-600 to-green-800"
            subtitle="เกษียณอายุ + กองทุนรวม"
          />
        </div>

        {/* รายละเอียดการคำนวณ */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Gift className="text-green-600" />
              โบนัสแต่ละปี
            </h3>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {bonusByYear.map((item, i) => (
                <div key={i} className="flex justify-between items-center py-2 border-b border-gray-100">
                  <div>
                    <span className="text-gray-600">ปี {item.year}</span>
                    <p className="text-xs text-gray-400">เงินเดือน {item.salary.toLocaleString()}฿</p>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-green-600">{item.bonus.toLocaleString()}฿</span>
                    <p className="text-xs text-gray-400">{bonusRate} เท่า</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg">
            <h3 className="text-lg font-bold text-gray-800 mb-4">🧮 สูตรเกษียณอายุ</h3>
            <div className="space-y-4">
              <div className={`${retirement1 >= retirement2 ? 'bg-green-50 border-2 border-green-200' : 'bg-gray-50'} rounded-lg p-4`}>
                <p className={`font-medium ${retirement1 >= retirement2 ? 'text-green-800' : 'text-gray-800'}`}>
                  สูตรที่ 1: เงินเดือน × 400 ÷ 30 {retirement1 >= retirement2 ? '⭐' : ''}
                </p>
                <p className={`text-sm mt-1 ${retirement1 >= retirement2 ? 'text-green-600' : 'text-gray-600'}`}>
                  {salaryAt60.toLocaleString()} × 400 ÷ 30 = {Math.round(retirement1).toLocaleString()} ฿
                </p>
                {retirement1 >= retirement2 && (
                  <p className="text-xs text-green-500 mt-2">✅ ใช้สูตรนี้เพราะให้ผลมากกว่า</p>
                )}
              </div>
              <div className={`${retirement2 > retirement1 ? 'bg-green-50 border-2 border-green-200' : 'bg-gray-50'} rounded-lg p-4`}>
                <p className={`font-medium ${retirement2 > retirement1 ? 'text-green-800' : 'text-gray-800'}`}>
                  สูตรที่ 2: เงินเดือน × อายุงาน ÷ 2 {retirement2 > retirement1 ? '⭐' : ''}
                </p>
                <p className={`text-sm mt-1 ${retirement2 > retirement1 ? 'text-green-600' : 'text-gray-600'}`}>
                  {salaryAt60.toLocaleString()} × {totalWorkYears} ÷ 2 = {Math.round(retirement2).toLocaleString()} ฿
                </p>
                {retirement2 > retirement1 && (
                  <p className="text-xs text-green-500 mt-2">✅ ใช้สูตรนี้เพราะให้ผลมากกว่า</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* สรุปผล */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-700 rounded-2xl p-8 text-white shadow-2xl">
          <div className="text-center">
            <DollarSign className="h-16 w-16 mx-auto mb-4 text-yellow-300" />
            <h2 className="text-3xl font-bold mb-2">รวมเงินทั้งหมดที่จะได้รับ</h2>
            <p className="text-6xl font-extrabold text-yellow-300 mb-4">
              {Math.round(totalMoney).toLocaleString()} ฿
            </p>
            <div className="text-lg text-indigo-100 space-y-1">
              <p>เงินเกษียณอายุ: {Math.round(retirementBenefit).toLocaleString()} ฿</p>
              <p>เงินกองทุนรวม: {Math.round(totalProvidentFund).toLocaleString()} ฿</p>
              <div className="text-sm text-indigo-200 mt-2 pl-4">
                <p>• เงินกองทุนเดิม: {existingFundAtRetirement.toLocaleString()} ฿</p>
                <p>• เงินกองทุนใหม่: {Math.round(futureProvidentFund).toLocaleString()} ฿</p>
              </div>
            </div>
            <p className="text-sm text-indigo-200 mt-4">
              * ไม่รวมโบนัสเพราะเป็นรายได้ระหว่างทำงาน
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-gray-500">
          <p className="text-sm">
            การคำนวณนี้เป็นการประมาณการ อาจมีการเปลี่ยนแปลงตามนโยบายของหน่วยงาน
          </p>
        </div>
      </div>
    </div>
  );
};

export default RetirementDashboard;