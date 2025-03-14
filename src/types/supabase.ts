type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      enrollments: {
        Row: {
          id: string
          student_id: string
          school: string
          class: string
          section: string | null
          roll_number: string | null
          start_date: string
          end_date: string | null
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          student_id: string
          school: string
          class: string
          section?: string | null
          roll_number?: string | null
          start_date: string
          end_date?: string | null
          status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          student_id?: string
          school?: string
          class?: string
          section?: string | null
          roll_number?: string | null
          start_date?: string
          end_date?: string | null
          status?: string
          created_at?: string
          updated_at?: string
        }
      }
      students: {
        Row: {
          id: string
          created_at: string
          personal_info: Json
          family_members: Json
          emergency_contact: Json
          education: Json
          work_experience: Json
          certificates: Json
          resume: Json
          user_id: string
        }
        Insert: {
          id?: string
          created_at?: string
          personal_info: Json
          family_members?: Json
          emergency_contact?: Json
          education?: Json
          work_experience?: Json
          certificates?: Json
          resume?: Json
          user_id: string
        }
        Update: {
          id?: string
          created_at?: string
          personal_info?: Json
          family_members?: Json
          emergency_contact?: Json
          education?: Json
          work_experience?: Json
          certificates?: Json
          resume?: Json
          user_id?: string
        }
      }
    }
  }
}