import React from 'react';

interface DateInputProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  placeholder?: string;
}

export const DateInput: React.FC<DateInputProps> = ({
  value,
  onChange,
  className = '',
  placeholder
}) => {
  const [year, month] = value ? value.split('-') : ['', ''];

  const handleYearChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newYear = e.target.value;
    if (newYear.length <= 4 && /^\d*$/.test(newYear)) {
      onChange(`${newYear}${month ? '-' + month : ''}`);
    }
  };

  const handleMonthChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newMonth = e.target.value.padStart(2, '0');
    onChange(`${year || new Date().getFullYear()}-${newMonth}`);
  };

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
    </div>
  );
};