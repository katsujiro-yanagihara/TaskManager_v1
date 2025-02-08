import React, { useState, useMemo, useEffect } from 'react';
import { X } from 'lucide-react';

const DateTimePicker = ({ 
  initialDateTime, 
  onSave, 
  onClose 
}) => {
  const [date, setDate] = useState(initialDateTime || new Date());
  const hasExistingTime = initialDateTime && (initialDateTime.getHours() !== 0 || initialDateTime.getMinutes() !== 0);
  const [useTime, setUseTime] = useState(hasExistingTime);
  const [hours, setHours] = useState(hasExistingTime ? initialDateTime.getHours().toString() : '');
  const [minutes, setMinutes] = useState(hasExistingTime ? initialDateTime.getMinutes().toString() : '');
  
  // 年の選択肢（現在年から5年後まで）
  const years = useMemo(() => 
    Array.from({ length: 6 }, (_, i) => new Date().getFullYear() + i),
    []
  );

  // 月の選択肢
  const months = useMemo(() => 
    Array.from({ length: 12 }, (_, i) => i + 1),
    []
  );

  // 日の選択肢（選択された年月に応じて変更）
  const getDaysInMonth = (year, month) => {
    return new Date(year, month, 0).getDate();
  };

  const days = Array.from(
    { length: getDaysInMonth(date.getFullYear(), date.getMonth() + 1) },
    (_, i) => i + 1
  );

  // 時間の選択肢（0-23）
  const hourOptions = useMemo(() => 
    Array.from({ length: 24 }, (_, i) => i),
    []
  );

  // 分の選択肢（0-59）
  const minuteOptions = useMemo(() => 
    Array.from({ length: 60 }, (_, i) => i),
    []
  );

  const handleSave = () => {
    const selectedDate = new Date(date);
    if (useTime && hours !== '' && minutes !== '') {
      selectedDate.setHours(parseInt(hours));
      selectedDate.setMinutes(parseInt(minutes));
    } else {
      selectedDate.setHours(0);
      selectedDate.setMinutes(0);
    }
    onSave(selectedDate, useTime);
  };

  return (
    <div className="fixed inset-0 bg-cyan-950/30 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white/95 rounded-2xl w-full max-w-md mx-4 max-h-[90vh] overflow-auto shadow-xl">
        <div className="p-4 border-b border-cyan-100 flex justify-between items-center bg-gradient-to-r from-cyan-50 to-blue-50">
          <h3 className="text-lg font-semibold text-cyan-900">期限を設定</h3>
          <button
            onClick={onClose}
            className="text-cyan-500 hover:text-cyan-700 transition-colors p-1 hover:bg-cyan-100 rounded-full"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6 bg-white">
          {/* 日付選択 */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-sm font-medium text-cyan-700 mb-2">
                年
              </label>
              <select
                className="w-full px-3 py-2.5 border border-cyan-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-400 
                bg-gradient-to-b from-cyan-50 to-white text-cyan-900 shadow-sm"
                value={date.getFullYear()}
                onChange={(e) => {
                  const newDate = new Date(date);
                  newDate.setFullYear(parseInt(e.target.value));
                  setDate(newDate);
                }}
              >
                {years.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-cyan-700 mb-2">
                月
              </label>
              <select
                className="w-full px-3 py-2.5 border border-cyan-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-400 
                bg-gradient-to-b from-cyan-50 to-white text-cyan-900 shadow-sm"
                value={date.getMonth() + 1}
                onChange={(e) => {
                  const newDate = new Date(date);
                  newDate.setMonth(parseInt(e.target.value) - 1);
                  setDate(newDate);
                }}
              >
                {months.map(month => (
                  <option key={month} value={month}>{month}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-cyan-700 mb-2">
                日
              </label>
              <select
                className="w-full px-3 py-2.5 border border-cyan-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-400 
                bg-gradient-to-b from-cyan-50 to-white text-cyan-900 shadow-sm"
                value={date.getDate()}
                onChange={(e) => {
                  const newDate = new Date(date);
                  newDate.setDate(parseInt(e.target.value));
                  setDate(newDate);
                }}
              >
                {days.map(day => (
                  <option key={day} value={day}>{day}</option>
                ))}
              </select>
            </div>
          </div>

          {/* 時間選択 */}
          <div className="space-y-3">
            <div className="flex items-center p-3 bg-cyan-50 rounded-lg">
              <input
                type="checkbox"
                id="useTime"
                checked={useTime}
                onChange={(e) => setUseTime(e.target.checked)}
                className="w-4 h-4 text-cyan-500 border-cyan-300 rounded focus:ring-cyan-500"
              />
              <label htmlFor="useTime" className="ml-2 text-sm text-cyan-700">
                時間を指定する
              </label>
            </div>

            {useTime && (
              <div className="grid grid-cols-2 gap-3 p-4 bg-cyan-50/50 rounded-xl">
                <div>
                  <label className="block text-sm font-medium text-cyan-700 mb-1">
                    時
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-cyan-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400 text-cyan-900"
                    value={hours}
                    onChange={(e) => {
                      setHours(e.target.value);
                      if (minutes === '') {
                        setMinutes('0');
                      }
                    }}
                  >
                    <option value="">選択</option>
                    {hourOptions.map(hour => (
                      <option key={hour} value={hour}>
                        {hour.toString().padStart(2, '0')}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-cyan-700 mb-1">
                    分
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-cyan-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400 text-cyan-900"
                    value={minutes}
                    onChange={(e) => setMinutes(e.target.value)}
                  >
                    <option value="">選択</option>
                    {minuteOptions.map(minute => (
                      <option key={minute} value={minute}>
                        {minute.toString().padStart(2, '0')}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}
          </div>

          <button
            onClick={handleSave}
            className="w-full px-4 py-3.5 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-xl 
            hover:from-cyan-600 hover:to-blue-600 transition-all duration-200 font-medium shadow-sm 
            hover:shadow-md active:scale-[0.99]"
          >
            設定
          </button>
        </div>
      </div>
    </div>
  );
};

export default DateTimePicker;