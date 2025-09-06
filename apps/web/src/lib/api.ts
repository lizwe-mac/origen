import type { 
  AuthSignupRequest, 
  AuthLoginRequest, 
  AuthResponse, 
  CreateManualReceiptRequest, 
  Receipt, 
  ApiResponse, 
  PaginatedResponse,
  ReceiptListQuery 
} from '@origen/models';

const API_BASE_URL = '/api';

class ApiClient {
  private token: string | null = null;

  constructor() {
    this.token = localStorage.getItem('auth_token');
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || 'Request failed');
    }

    return data;
  }

  setToken(token: string) {
    this.token = token;
    localStorage.setItem('auth_token', token);
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('auth_token');
  }

  // Auth endpoints
  async signup(data: AuthSignupRequest): Promise<AuthResponse> {
    const response = await this.request<AuthResponse>('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response.data!;
  }

  async login(data: AuthLoginRequest): Promise<AuthResponse> {
    const response = await this.request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response.data!;
  }

  // Receipt endpoints
  async createManualReceipt(data: CreateManualReceiptRequest): Promise<Receipt> {
    const response = await this.request<Receipt>('/receipts/manual', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response.data!;
  }

  async uploadReceipt(file: File): Promise<Receipt> {
    const formData = new FormData();
    formData.append('file', file);

    const url = `${API_BASE_URL}/receipts/upload`;
    const headers: HeadersInit = {};

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || 'Upload failed');
    }

    return data.data;
  }

  async getReceipt(id: string): Promise<Receipt> {
    const response = await this.request<Receipt>(`/receipts/${id}`);
    return response.data!;
  }

  async updateReceipt(id: string, data: Partial<CreateManualReceiptRequest>): Promise<Receipt> {
    const response = await this.request<Receipt>(`/receipts/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
    return response.data!;
  }

  async listReceipts(query: ReceiptListQuery = {}): Promise<PaginatedResponse<Receipt>> {
    const searchParams = new URLSearchParams();
    
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, String(value));
      }
    });

    const response = await this.request<PaginatedResponse<Receipt>>(
      `/receipts?${searchParams.toString()}`
    );
    return response.data!;
  }
}

export const apiClient = new ApiClient();
