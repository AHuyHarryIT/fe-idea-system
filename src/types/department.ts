export interface DepartmentIdea {
  id: string
  text: string
}

export interface Department {
  id: string
  name: string
  description?: string
  ideas?: DepartmentIdea[]
}

export interface DepartmentListResponse {
  departments?: Department[]
}

export interface CreateDepartmentPayload {
  name: string
  description?: string
}

export interface UpdateDepartmentPayload {
  name: string
  description?: string
}
