export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      students: {
        Row: {
          id: string
          created_at: string
          personal_info: Json
          family_members: Json
          identity_document: Json
          emergency_contact: Json
          education: Json
          work_experience: Json
          certificates: Json
          resume: Json
          enrollment: Json
          user_id: string
        }
        Insert: {
          id?: string
          created_at?: string
          personal_info: Json
          family_members?: Json
          identity_document?: Json
          emergency_contact?: Json
          education?: Json
          work_experience?: Json
          certificates?: Json
          resume?: Json
          enrollment?: Json
          user_id: string
        }
        Update: {
          id?: string
          created_at?: string
          personal_info?: Json
          family_members?: Json
          identity_document?: Json
          emergency_contact?: Json
          education?: Json
          work_experience?: Json
          certificates?: Json
          resume?: Json
          enrollment?: Json
          user_id?: string
        }
      }
    }
  }
}