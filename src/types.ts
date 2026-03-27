export interface BOQItem {
  id: string;
  project_id: string;
  item_name: string;
  description: string;
  unit: string;
  quantity: number;
  rate?: number;
  amount?: number;
  category: string;
  created_at: string;
}

export interface ProgressUpdate {
  id: string;
  project_id: string;
  photo_url: string;
  completion_percentage: number;
  deviations: {
    item: string;
    description: string;
    severity: 'Low' | 'Medium' | 'High';
  }[];
  analysis_summary: string;
  created_at: string;
}

export interface BIMComponent {
  id: string;
  project_id: string;
  category: 'Structural' | 'MEP' | 'Architectural';
  type: string;
  name: string;
  properties: Record<string, any>;
  created_at: string;
}

export interface Project {
  id: string;
  name: string;
  type: string;
  location: string;
  investor: string;
  designer: string;
  status: 'Concept' | 'Technical' | 'Construction' | 'Completed';
  progress: number;
  compliance_score?: number;
  risk_level?: 'Low' | 'Medium' | 'High';
  created_at: string;
  progress_updates?: ProgressUpdate[];
  bim_components?: BIMComponent[];
}

export interface ProjectFile {
  id: string;
  project_id: string;
  name: string;
  category: string;
  format: string;
  url: string;
  created_at: string;
}

export interface CheckResult {
  id: string;
  project_id: string;
  module: string;
  check_item: string;
  status: 'OK' | 'NO';
  issue_description: string;
  suggested_fix: string;
  created_at: string;
}

export interface Regulation {
  id: string;
  code: string;
  title: string;
  description: string;
  category: string;
  full_text?: string;
  effective_date?: string;
  status?: string;
}

export const PROJECT_TYPES = [
  "Chung cư cao tầng",
  "Cao ốc văn phòng",
  "Nhà xưởng khu công nghiệp",
  "Resort",
  "Nhà ở riêng lẻ",
  "Công trình khác"
];

export const FILE_CATEGORIES = [
  "concept",
  "tong_mat_bang",
  "thiet_ke_co_so",
  "thiet_ke_ky_thuat",
  "ban_ve_thi_cong",
  "shopdrawing"
];

export const DESIGN_MODULES = [
  {
    id: "concept",
    module: "Concept Check",
    checklist: ["quy_hoach", "mat_do_xay_dung", "chieu_cao", "cong_nang", "giao_thong", "khong_gian_xanh"],
    icon: "Layout"
  },
  {
    id: "site",
    module: "Tong Mat Bang Check",
    checklist: ["chi_gioi_xay_dung", "khoang_lui", "mat_do_xay_dung", "he_so_su_dung_dat", "giao_thong_noi_bo", "cay_xanh", "pccc"],
    icon: "Map"
  },
  {
    id: "basic",
    module: "Thiet Ke Co So Check",
    checklist: ["kien_truc", "ket_cau", "dien", "nuoc", "pccc", "ha_tang"],
    icon: "FileCode"
  },
  {
    id: "technical",
    module: "Thiet Ke Ky Thuat Check",
    checklist: ["chi_tiet_cau_tao", "kich_thuoc", "cao_do", "vat_lieu", "tieu_chuan"],
    icon: "Settings"
  },
  {
    id: "shop",
    module: "Shopdrawing Check",
    checklist: ["sai_khac_thiet_ke", "thieu_kich_thuoc", "thieu_chi_tiet", "sai_vat_lieu"],
    icon: "PenTool"
  },
  {
    id: "clash",
    module: "Clash Detection",
    checklist: ["pipe_beam_collision", "duct_beam_collision", "cable_structure_collision"],
    icon: "Zap"
  },
  {
    id: "dwg",
    module: "DWG Smart Analysis",
    checklist: ["layer_standardization", "block_integrity", "dimension_accuracy", "annotation_check", "clash_pre_check"],
    icon: "FileText"
  },
  {
    id: "pccc",
    module: "Kiểm tra PCCC (QCVN 06)",
    checklist: ["bac_chiu_lua", "khoang_cach_pccc", "loi_thoat_nan", "he_thong_bao_chay", "he_thong_chua_chay", "ngan_khoi"],
    icon: "Shield"
  },
  {
    id: "qto",
    module: "Automated QTO",
    checklist: ["concrete_volume", "steel_weight", "formwork_area", "brick_count", "finishing_area"],
    icon: "Calculator"
  },
  {
    id: "progress",
    module: "Site Progress AI",
    checklist: ["foundation_completion", "structural_frame_status", "finishing_progress", "safety_compliance"],
    icon: "Camera"
  },
  {
    id: "iot",
    module: "Digital Twin Sync",
    checklist: ["sensor_connectivity", "real_time_data_sync", "anomaly_detection", "maintenance_prediction"],
    icon: "Activity"
  }
];
