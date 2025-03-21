import React, { useEffect, useState } from 'react';
import type { StudentRegistration } from '../types/student';
import { formatJapaneseDate } from "../utils/dateUtils";
import { supabase } from '../lib/supabase';

interface TestRecord {
  id: string;
  passed_date: string;
  type: string;
  skill_category: string;
}

interface JapaneseCVProps {
  student: StudentRegistration & { id: string };
}

export const JapaneseCV: React.FC<JapaneseCVProps> = ({ student }) => {
  const [testRecords, setTestRecords] = useState<TestRecord[]>([]);

  useEffect(() => {
    const fetchTestRecords = async () => {
      const { data, error } = await supabase
        .from('tests')
        .select('*')
        .eq('student_id', student.id)
        .order('passed_date', { ascending: true });

      if (error) {
        console.error('Error fetching test records:', error);
        return;
      }

      setTestRecords(data || []);
    };

    fetchTestRecords();
  }, [student.id]);

  const today = new Date();
  const age = Math.floor(
    (today.getTime() - new Date(student.personalInfo.dateOfBirth).getTime()) / 
    (365.25 * 24 * 60 * 60 * 1000)
  );

  const formatTestName = (test: TestRecord): string => {
    switch (test.type) {
      case 'jft_basic_a2':
        return '国際交流基金日本語基礎テスト（JFT- Basic） A2 合格';
      case 'kaigo_lang':
        return '介護日本語評価試験 合格';
      case 'skill':
        return `${test.skill_category || ''}技能評価試験 (NEPALESE) 合格`;
      default:
        return `${test.skill_category ? ` ${test.skill_category}` : ''}${test.type} 合格`;
    }
  };

  /**
   * Gets the display year and month from endDate or startDate
   * Priority order:
   * 1. endDate with valid year and non-00 month
   * 2. endDate with valid year and 00 month
   * 3. startDate if endDate has empty year and 00 month
   * 4. startDate if endDate is invalid/empty
   */
  const getDisplayDate = (endDate?: string, startDate?: string) => {
    // Case 1: Use endDate if it has valid year and non-00 month
    if (endDate) {
      const [year, month] = endDate.split('-');
      if (year && month !== '00') {
        return { year, month };
      }
    }

    // Case 2 & 3: Handle endDate with 00 month
    if (endDate) {
      const [year, month] = endDate.split('-');
      if (year && month === '00') {
        // Case 3: Empty year with 00 month - fallback to startDate
        if (!year.trim()) {
          const [startYear, startMonth] = (startDate || '').split('-');
          return { 
            year: startYear || '', 
            month: startMonth === '00' ? '' : startMonth || '' 
          };
        }
        // Case 2: Valid year with 00 month
        return { year, month: '' };
      }
    }

    // Case 4: Fallback to startDate for all other cases
    const [year, month] = (startDate || '').split('-');
    return { 
      year: year || '', 
      month: month === '00' ? '' : month || '' 
    };
  };

  const formatBirthDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return {
      year: date.getFullYear(),
      month: date.getMonth() + 1,
      day: date.getDate()
    };
  };

  return (
    <div className="w-full max-w-4xl mx-auto bg-white shadow-lg animate-scale-in print:shadow-none">
      <div className="p-8 print:p-0 font-jp">
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <h1 className="text-4xl font-bold tracking-wider">履 歴 書</h1>
          <p className="text-right">{formatJapaneseDate(today)}</p>
        </div>

        <table className="cv-table mb-4">
          <tbody>
            <tr>
              <th className="w-1/4">ふりがな</th>
              <td colSpan={3}>{student.resume.lastNameKana} {student.resume.firstNameKana}</td>
              <td rowSpan={3} className="w-1/4">
                {student.resume.photo ? (
                  <div className="flex justify-center">
                    <img 
                      src={student.resume.photo} 
                      alt="ID Photo" 
                      className="w-32 h-40 object-cover border border-gray-300"
                    />
                  </div>
                ) : (
                  <div className="w-32 h-40 mx-auto border border-gray-300 flex items-center justify-center text-gray-400">
                    写真
                  </div>
                )}
              </td>
            </tr>
            <tr>
              <th>名前</th>
              <td colSpan={3} className="text-xl font-semibold">{student.personalInfo.lastName} {student.personalInfo.firstName}</td>
            </tr>
            <tr>
              <th className="w-1/6">
                生年月日
              </th>
              <td className="w-1/2 text-center text-sm">
                {(() => {
                  const birth = formatBirthDate(student.personalInfo.dateOfBirth);
                  return (
                    <>
                      <span>{birth.year}年</span>
                      <span>{birth.month}月</span>
                      <span>{birth.day}日</span>
                      <span className="ml-2">（満{age}歳）</span>
                    </>
                  );
                })()}
              </td>
              <th className="w-1/6">性別</th>
              <td> {student.personalInfo.gender === 'male' ? '男' : student.personalInfo.gender === 'female' ? '女' : 'その他'}</td>
            </tr>
            <tr>
              <th rowSpan={4}>現住所</th>
              <td rowSpan={4} colSpan={3}>
                <div className="flex flex-col">
                  <span className="mt-2">{student.personalInfo.address}</span>
                </div>
              </td>
              <th>電話</th>
            </tr>
            <tr>
                <td>
                  <div className="flex flex-col h-full">
                    <div className="flex flex-col mb-4">
                      <span>{student.personalInfo.phone}</span>
                    </div>
                  </div> 
                </td>
            </tr>
            <tr>
                <th>メールアドレス</th>
            </tr>
            <tr>
                <td>
                   <div className="flex flex-col h-full">
                    <div className="flex flex-col text-xs">
                      <span>{student.personalInfo.email}</span>
                    </div>
                  </div> 
                </td>
            </tr>
            <tr>
              <th>国籍</th>
              <td>{student.personalInfo.country === 'Nepal' ? 'ネパール' : student.personalInfo.country}</td>
              <th colSpan={2}>言語知識</th>
              <td className="text-xs">{student.personalInfo.languages}</td>
            </tr>
            <tr>
              <th>婚姻</th>
              <td >{student.personalInfo.maritalStatus === 'single' ? '独身' : '既婚'}</td>
              <th colSpan={2}>子供</th>
              <td>{student.personalInfo.numberOfChildren > 0 ? `${student.personalInfo.numberOfChildren}人` : '無し'}</td>
            </tr>
            <tr>
              <th>来日可能日</th>
              <td>{student.resume.possibleStartDate ? new Date(student.resume.possibleStartDate).toLocaleDateString('ja-JP', { year: 'numeric', month: 'short', day: 'numeric' }) : 'いつでも可能'}</td>
              <th colSpan={2}>希望職種</th>
              <td>{student.resume.jobCategory}</td>
            </tr>
          </tbody>
        </table>

        {/* Education Table */}
        <table className="cv-table mb-4">
          <thead>
            <tr>
              <th colSpan={3}>学歴</th>
            </tr>
            <tr>
              <th className="w-1/12">年</th>
              <th className="w-1/12">月</th>
              <th>学校名</th>
            </tr>
          </thead>
          <tbody>
            {student.education.map((edu, index) => {
              const date = getDisplayDate(edu.endDate, edu.startDate);
              return (
                <tr key={`edu-${index}`}>
                  <td className="text-center">{date.year}</td>
                  <td className="text-center">{date.month}</td>
                  <td>{edu.institution}</td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* Work History Table */}
        <table className="cv-table mb-4">
          <thead>
             <tr>
              <th colSpan={3} >職歴 (アルバイト含む)</th>
            </tr>
            <tr>
              <th className="w-1/12">年</th>
              <th className="w-1/12">月</th>
              <th>会社名</th>
            </tr>
          </thead>
          <tbody>
            {student.workExperience.map((work, index) => {
              const date = getDisplayDate(work.endDate, work.startDate);
              return (
                <tr key={`work-${index}`}>
                  <td className="text-center">{date.year}</td>
                  <td className="text-center">{date.month}</td>
                  <td>{work.company}({work.position})</td>
                </tr>
              );
            })}
           
          </tbody>
        </table>

        {/* Add page break before certificates section */}
        <div className="page-break-before"></div>

        {/* Certificates and Tests Section */}
        <table className="cv-table mb-4">
          <thead>
             <tr>
              <th colSpan={3}>免許・資格</th>
            </tr>
            <tr>
              <th className="w-1/12">年</th>
              <th className="w-1/12">月</th>
              <th>資格名</th>
            </tr>
          </thead>
          <tbody>
            {[...student.certificates, ...testRecords.map(test => ({
              date: test.passed_date || '',
              name: formatTestName(test)
            }))].sort((a, b) => {
              const dateA = a.date ? new Date(a.date) : new Date(0);
              const dateB = b.date ? new Date(b.date) : new Date(0);
              return dateB.getTime() - dateA.getTime();
            }).map((item, index) => {
              const date = getDisplayDate(item.date);
              return (
                <tr key={`cert-${index}`}>
                  <td className="text-center">{date.year}</td>
                  <td className="text-center">{date.month}</td>
                  <td>{item.name}</td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* Physical Information & Restrictions Table */}
        <table className="cv-table mb-4">
          <tbody>
            <tr>
              <th className="w-1/6">宗教</th>
              <td className="w-1/5">{student.personalInfo.religion}</td>
              <th className="w-1/3">食べられないもの</th>
              <td>{student.resume.dietaryRestriction}</td>
            </tr>
          </tbody>
        </table>

        {/* Physical Information Table */}
        <table className="cv-table mb-4">
          <tbody>
            <tr>
              <th>身長</th>
              <td className="w-1/4">{student.resume.height} CM</td>
              <th>体重</th>
              <td className="w-1/4">{student.resume.weight} KG</td>
              <th>靴のサイズ</th>
              <td>{student.resume.shoeSize} CM</td>
            </tr>
          </tbody>
        </table>

        {/* Self Introduction Section */}
        <div className="mb-4">
          <div className="border border-gray-300">
            <table className="cv-table">
              <thead>
                <tr>
                  <th colSpan={6}>その他・ご自身について</th>
                </tr>
                </thead>
                <tbody>
                <tr>
                  <th className="w-1/6 text-center align-middle">
                    自己PR<br />志望動機
                  </th>
                  <td colSpan={5} className="whitespace-pre-wrap">{student.resume.selfIntroduction}</td>
                </tr>
                <tr>
                  <th>長所</th>
                  <td colSpan={2}>{student.resume.strength}</td>
                   <th>短所</th>
                  <td colSpan={2}>{student.resume.weakness}</td>
                </tr>
                <tr>
                  <th>趣味など</th>
                  <td colSpan={5} >{student.resume.hobbies}</td>
                </tr>
                <tr>
                  <th rowSpan={student.familyMembers.length + 1}>同居の家族</th>
                  <th className="w-1/3 text-center border-none">氏名</th>
                  <th className="w-1/12 text-center border-none">性別</th>
                  <th className="w-1/12 text-center border-none">年齢</th>
                  <th className="w-1/12 text-center border-none">関係</th>
                  <th className="w-1/3 text-center border-none">職業</th>
                </tr>
                        {student.familyMembers.map((member, index) => (
                          <tr key={index}>
                            <td className="text-center border-none">{member.name}</td>
                            <td className="text-center border-none">
                              {member.gender === 'male' ? '男' : member.gender === 'female' ? '女' : 'その他'}
                            </td>
                            <td className="text-center border-none">{member.age}</td>
                            <td className="text-center border-none">{member.relationship}</td>
                            <td className="text-center border-none">{member.job}</td>
                          </tr>
                        ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};