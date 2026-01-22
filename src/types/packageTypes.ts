// Package Management Types

export interface Class {
  id: string;
  name: string;
  description?: string;
  createdAt: Date;
}

export interface Stream {
  id: string;
  name: string;
  description?: string;
  createdAt: Date;
}

export interface Subject {
  id: string;
  name: string;
  description?: string;
  createdAt: Date;
}

export interface Package {
  id: string;
  name: string;
  type: 'class' | 'subject' | 'stream' | 'test_series' | 'chapter';
  description?: string;
  price: number;
  durationMonths: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface PackageMapping {
  id: string;
  packageId: string;
  classId?: string;
  streamId?: string;
  subjectId?: string;
  chapterId?: string;
}

export interface Student {
  id: string;
  email: string;
  password_hash: string;
  first_name: string;
  last_name?: string;
  phone?: string;
  class_id?: string;
  stream_id?: string;
  is_active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Order {
  id: string;
  studentId: string;
  totalAmount: number;
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderItem {
  id: string;
  orderId: string;
  packageId: string;
  price: number;
  createdAt: Date;
}

export interface StudentAccess {
  id: string;
  studentId: string;
  packageId: string;
  expiresAt: Date;
  activatedAt: Date;
}

// Extended types with joined data
export interface PackageWithDetails extends Package {
  class_name?: string;
  stream_name?: string;
  subject_name?: string;
}

export interface StudentAccessiblePackage extends StudentAccess {
  package_name: string;
  package_type: string;
  description?: string;
  class_name?: string;
  stream_name?: string;
  subject_name?: string;
}

// Request/Response types
export interface CreatePackageRequest {
  package_name: string;
  package_type: 'class' | 'subject' | 'stream' | 'test_series' | 'chapter';
  description?: string;
  price: number;
  duration_months: number;
  class_id?: string;
  stream_id?: string;
  subject_id?: string;
  chapter_id?: string;
}

export interface UpdatePackageRequest {
  package_name?: string;
  description?: string;
  price?: number;
  duration_months?: number;
  is_active?: boolean;
}

export interface CreateOrderRequest {
  package_ids: string[];
}

export interface OrderResponse {
  order_id: string;
  student_id: string;
  total_amount: number;
  payment_status: string;
  items: {
    package_id: string;
    package_name: string;
    price: number;
  }[];
}

export interface PackageFilter {
  package_type?: string;
  class_id?: string;
  stream_id?: string;
  subject_id?: string;
  is_active?: boolean;
  min_price?: number;
  max_price?: number;
}
