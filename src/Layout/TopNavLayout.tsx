import { useState } from 'react'
import { FaChevronDown, FaGraduationCap, FaRegUser } from 'react-icons/fa6'
import { MdOutlineLogin } from 'react-icons/md'

interface TopNavProps {
  academicYear: string
  onAcademicYearChange: (year: string) => void
  onLogout: () => void
  userRole: string
}

export default function TopNav({
  academicYear,
  onAcademicYearChange,
  onLogout,
  userRole,
}: TopNavProps) {
  const [showYearDropdown, setShowYearDropdown] = useState(false)
  const [showProfileDropdown, setShowProfileDropdown] = useState(false)

  const academicYears = ['2023-2024', '2024-2025', '2025-2026', '2026-2027']

  const getRoleName = () => {
    switch (userRole) {
      case 'admin':
        return 'Administrator'
      case 'qa_manager':
        return 'QA Manager'
      case 'qa_coordinator':
        return 'QA Coordinator'
      case 'staff':
        return 'Staff'
      default:
        return 'User'
    }
  }

  return (
    <nav className="bg-white border-b border-slate-200 h-16 fixed top-0 left-0 right-0 z-50">
      <div className="h-full px-6 flex items-center justify-between">
        {/* Left: Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
            <FaGraduationCap className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-lg text-slate-800">Idea Collection System</h1>
            <p className="text-xs text-slate-500">
              University Management Portal
            </p>
          </div>
        </div>

        {/* Right: Academic Year & Profile */}
        <div className="flex items-center gap-4">
          {/* Academic Year Selector */}
          <div className="relative">
            <button
              onClick={() => setShowYearDropdown(!showYearDropdown)}
              className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            >
              <span className="text-sm text-slate-700">
                Academic Year: {academicYear}
              </span>
              <FaChevronDown className="w-4 h-4 text-slate-500" />
            </button>

            {showYearDropdown && (
              <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-lg shadow-lg overflow-hidden">
                {academicYears.map((year) => (
                  <button
                    key={year}
                    onClick={() => {
                      onAcademicYearChange(year)
                      setShowYearDropdown(false)
                    }}
                    className={`w-full text-left px-4 py-2 text-sm hover:bg-slate-50 transition-colors ${
                      year === academicYear
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-slate-700'
                    }`}
                  >
                    {year}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Profile Menu */}
          <div className="relative">
            <button
              onClick={() => setShowProfileDropdown(!showProfileDropdown)}
              className="flex items-center gap-3 px-4 py-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <div className="w-8 h-8 bg-slate-300 rounded-full flex items-center justify-center">
                <FaRegUser className="w-4 h-4 text-slate-600" />
              </div>
              <div className="text-left">
                <p className="text-sm text-slate-800">{getRoleName()}</p>
                <p className="text-xs text-slate-500">Account</p>
              </div>
              <FaChevronDown className="w-4 h-4 text-slate-500" />
            </button>

            {showProfileDropdown && (
              <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-lg shadow-lg overflow-hidden">
                <button
                  onClick={onLogout}
                  className="w-full text-left px-4 py-3 text-sm text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-2"
                >
                  <MdOutlineLogin className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
