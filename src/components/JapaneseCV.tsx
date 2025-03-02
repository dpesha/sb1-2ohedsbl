import React from 'react';
import type { StudentRegistration } from '../types/student';
import { formatJapaneseDate } from "../utils/dateUtils";

interface JapaneseCVProps {
  student: StudentRegistration & { id: string };
}

export const JapaneseCV: React.FC<JapaneseCVProps> = ({ student }) => {
  const today = new Date();
  const age = Math.floor(
    (today.getTime() - new Date(student.personalInfo.dateOfBirth).getTime()) / 
    (365.25 * 24 * 60 * 60 * 1000)
  );

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
              <td colSpan={3}>{student.resume.firstNameKana} {student.resume.lastNameKana}</td>
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
              <td colSpan={3} className="text-xl font-semibold">{student.personalInfo.firstName} {student.personalInfo.lastName}</td>
            </tr>
            <tr>
              <th>
                <div className="flex justify-between">
                  <span>生年月日</span>
                </div>
              </th>
              <td colSpan={3} className="w-full text-center">
                <span>{new Date(student.personalInfo.dateOfBirth).getFullYear()}年</span>
              　<span>{new Date(student.personalInfo.dateOfBirth).getMonth() + 1}月</span>
                <span>{new Date(student.personalInfo.dateOfBirth).getDate()}日</span>
                  <span>（満</span>
                  <span>{age}</span>
                  <span>歳）</span>
              </td>
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
                    <div className="flex flex-col">
                      <span>{student.personalInfo.email}</span>
                    </div>
                  </div> 
                </td>
            </tr>
            <tr>
              <th>婚姻</th>
              <td colSpan={2}>{student.personalInfo.maritalStatus === 'single' ? '独身' : '既婚'}</td>
              <th>子供</th>
              <td>{student.personalInfo.numberOfChildren > 0 ? `${student.personalInfo.numberOfChildren}人` : '無し'}</td>
            </tr>
            <tr>
              <th>就業可能時期</th>
              <td colSpan={2}>{student.resume.possibleStartDate ? new Date(student.resume.possibleStartDate).toLocaleDateString('ja-JP') : 'いつでも可能'}</td>
              <th>希望職種</th>
              <td>{student.resume.jobCategory === 'nursing' ? '介護' : student.resume.jobCategory}</td>
            </tr>
          </tbody>
        </table>

        {/* Education Table */}
        <table className="cv-table mb-4">
          <thead>
            <tr>
              <th className="w-1/12">年</th>
              <th className="w-1/12">月</th>
              <th>学歴</th>
            </tr>
          </thead>
          <tbody>
            {student.education.map((edu, index) => (
              <tr key={`edu-${index}`}>
                <td className="text-center">{new Date(edu.startDate).getFullYear()}</td>
                <td className="text-center">{new Date(edu.startDate).getMonth() + 1}</td>
                <td>{edu.institution} {edu.degree === 'highSchool' ? '卒業' : '入学'}</td>
              </tr>
            ))}
            {Array.from({ length: 4 - student.education.length }).map((_, index) => (
              <tr key={`empty-edu-${index}`}>
                <td></td>
                <td></td>
                <td></td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Work History Table */}
        <table className="cv-table mb-4">
          <thead>
            <tr>
              <th className="w-1/12">年</th>
              <th className="w-1/12">月</th>
              <th>職歴</th>
            </tr>
          </thead>
          <tbody>
            {student.workExperience.map((work, index) => (
              <tr key={`work-${index}`}>
                <td className="text-center">{new Date(work.startDate).getFullYear()}</td>
                <td className="text-center">{new Date(work.startDate).getMonth() + 1}</td>
                <td>{work.company} {work.position}</td>
              </tr>
            ))}
            {Array.from({ length: 5 - student.workExperience.length }).map((_, index) => (
              <tr key={`empty-work-${index}`}>
                <td></td>
                <td></td>
                <td></td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Licenses & Qualifications Table */}
        <table className="cv-table mb-4">
          <thead>
            <tr>
              <th className="w-1/12">年</th>
              <th className="w-1/12">月</th>
              <th>免許・資格</th>
            </tr>
          </thead>
          <tbody>
            {student.certificates.map((cert, index) => (
              <tr key={`cert-${index}`}>
                <td className="text-center">{new Date(cert.date).getFullYear()}</td>
                <td className="text-center">{new Date(cert.date).getMonth() + 1}</td>
                <td>{cert.name}</td>
              </tr>
            ))}
            {Array.from({ length: 5 - student.certificates.length }).map((_, index) => (
              <tr key={`empty-license-${index}`}>
                <td></td>
                <td></td>
                <td></td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Self Introduction Section */}
        <div className="mb-4">
          <h2 className="text-lg font-semibold border-b border-black pb-1 mb-2">自己PR・志望動機</h2>
          <div className="min-h-[200px] p-2 border border-gray-300 whitespace-pre-wrap">
            {student.resume.selfIntroduction}
          </div>
        </div>
      </div>
    </div>
  );
};