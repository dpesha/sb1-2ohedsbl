import React from 'react';

interface FullDateInputProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  placeholder?: string;
}

export const FullDateInput: React.FC<FullDateInputProps> = ({
  value,
  onChange,
  className = '',
  placeholder
}) => {
  const [year, month, day] = value ? value.split('-') : ['', '', ''];

  const handleYearChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newYear = e.target.value;
    if (newYear.length <= 4 && /^\d*$/.test(newYear)) {
      onChange(`${newYear}${month ? '-' + month : ''}${day ? '-' + day : ''}`);
    }
  };

  const handleMonthChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newMonth = e.target.value.padStart(2, '0');
    const maxDay = getMaxDays(Number(year), Number(newMonth));
    const newDay = Number(day) > maxDay ? String(maxDay) : day;
    onChange(`${year || new Date().getFullYear()}-${newMonth}${newDay ? '-' + newDay.padStart(2, '0') : ''}`);
  };

  const handleDayChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newDay = e.target.value.padStart(2, '0');
    onChange(`${year || new Date().getFullYear()}-${month || '01'}-${newDay}`);
  };

  const getMaxDays = (year: number, month: number): number => {
    if (month === 2) {
      return isLeapYear(year) ? 29 : 28;
    }
    return [4, 6, 9, 11].includes(month) ? 30 : 31;
  };

  const isLeapYear = (year: number): boolean => {
    return year % 400 === 0 || (year % 100 !== 0 && year % 4 === 0);
  };

  const maxDays = month ? getMaxDays(Number(year) || new Date().getFullYear(), Number(month)) : 31;
  const days = Array.from({ length: maxDays }, (_, i) => i + 1);

  return (
    <div className={`flex gap-2 ${className}`}>
      <input
        type="text"
        value={year}
        onChange={handleYearChange}
        placeholder="YYYY"
        className="w-20 px-3 py-2 border rounded-md text-center"
        maxLength={4}
      />
      <select
        value={month}
        onChange={handleMonthChange}
        className="flex-1 px-3 py-2 border rounded-md"
      >
        <option value="">Month</option>
        <option value="01">January</option>
        <option value="02">February</option>
        <option value="03">March</option>
        <option value="04">April</option>
        <option value="05">May</option>
        <option value="06">June</option>
        <option value="07">July</option>
        <option value="08">August</option>
        <option value="09">September</option>
        <option value="10">October</option>
        <option value="11">November</option>
        <option value="12">December</option>
      </select>
      <select
        value={day}
        onChange={handleDayChange}
        className="w-24 px-3 py-2 border rounded-md"
      >
        <option value="">Day</option>
        {days.map(d => (
          <option key={d} value={String(d).padStart(2, '0')}>
            {d}
          </option>
        ))}
      </select>
    </div>
  );
};