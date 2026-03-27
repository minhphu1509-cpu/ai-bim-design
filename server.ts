import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import path from "path";
import multer from "multer";
import fs from "fs";

const db = new Database("bim_checker.db");

// Ensure uploads directory exists
const uploadDir = path.resolve("uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Configure multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + "-" + file.originalname);
  },
});
const upload = multer({ 
  storage,
  limits: { fileSize: 100 * 1024 * 1024 } // 100MB
});

// Initialize database
db.exec(`
  CREATE TABLE IF NOT EXISTS projects (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    location TEXT,
    investor TEXT,
    designer TEXT,
    status TEXT DEFAULT 'Concept',
    progress INTEGER DEFAULT 0,
    compliance_score INTEGER DEFAULT 100,
    risk_level TEXT DEFAULT 'Low',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

// Migration: Ensure status column exists in projects table
try {
  db.prepare("SELECT status FROM projects LIMIT 1").get();
} catch (e: any) {
  if (e.message.includes("no such column: status")) {
    db.exec("ALTER TABLE projects ADD COLUMN status TEXT DEFAULT 'Concept'");
  }
}

// Migration: Ensure progress column exists in projects table
try {
  db.prepare("SELECT progress FROM projects LIMIT 1").get();
} catch (e: any) {
  if (e.message.includes("no such column: progress")) {
    db.exec("ALTER TABLE projects ADD COLUMN progress INTEGER DEFAULT 0");
  }
}

// Migration: Ensure compliance_score column exists in projects table
try {
  db.prepare("SELECT compliance_score FROM projects LIMIT 1").get();
} catch (e: any) {
  if (e.message.includes("no such column: compliance_score")) {
    db.exec("ALTER TABLE projects ADD COLUMN compliance_score INTEGER DEFAULT 100");
  }
}

// Migration: Ensure risk_level column exists in projects table
try {
  db.prepare("SELECT risk_level FROM projects LIMIT 1").get();
} catch (e: any) {
  if (e.message.includes("no such column: risk_level")) {
    db.exec("ALTER TABLE projects ADD COLUMN risk_level TEXT DEFAULT 'Low'");
  }
}

db.exec(`
  CREATE TABLE IF NOT EXISTS files (
    id TEXT PRIMARY KEY,
    project_id TEXT NOT NULL,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    format TEXT NOT NULL,
    url TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id)
  );

  CREATE TABLE IF NOT EXISTS check_results (
    id TEXT PRIMARY KEY,
    project_id TEXT NOT NULL,
    module TEXT NOT NULL,
    check_item TEXT NOT NULL,
    status TEXT NOT NULL,
    issue_description TEXT,
    suggested_fix TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id)
  );

  CREATE TABLE IF NOT EXISTS regulations (
    id TEXT PRIMARY KEY,
    code TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    category TEXT,
    full_text TEXT,
    effective_date TEXT,
    status TEXT DEFAULT 'Active'
  );

  CREATE TABLE IF NOT EXISTS chat_messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    role TEXT NOT NULL,
    text TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS boq_items (
    id TEXT PRIMARY KEY,
    project_id TEXT NOT NULL,
    item_name TEXT NOT NULL,
    description TEXT,
    unit TEXT,
    quantity REAL,
    rate REAL,
    amount REAL,
    category TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id)
  );

  CREATE TABLE IF NOT EXISTS progress_updates (
    id TEXT PRIMARY KEY,
    project_id TEXT NOT NULL,
    photo_url TEXT,
    completion_percentage INTEGER DEFAULT 0,
    deviations TEXT,
    analysis_summary TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id)
  );

  CREATE TABLE IF NOT EXISTS bim_components (
    id TEXT PRIMARY KEY,
    project_id TEXT NOT NULL,
    category TEXT NOT NULL,
    type TEXT NOT NULL,
    name TEXT NOT NULL,
    properties TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id)
  );
`);

// Seed regulations if empty
const regCount = db.prepare("SELECT COUNT(*) as count FROM regulations").get() as { count: number };
if (regCount.count === 0) {
  const initialRegs = [
    { 
      id: 'REG-001', 
      code: 'QCVN 01:2021/BXD', 
      title: 'Quy chuẩn kỹ thuật quốc gia về Quy hoạch xây dựng', 
      description: 'Quy định về các chỉ tiêu quy hoạch, mật độ xây dựng, hệ số sử dụng đất.',
      category: 'Planning',
      full_text: 'Quy chuẩn này quy định về các mức giới hạn của các chỉ tiêu kỹ thuật và yêu cầu quản lý bắt buộc phải tuân thủ trong công tác lập, thẩm định, phê duyệt, điều chỉnh quy hoạch xây dựng...',
      effective_date: '2021-07-05'
    },
    { 
      id: 'REG-002', 
      code: 'QCVN 06:2022/BXD', 
      title: 'Quy chuẩn kỹ thuật quốc gia về An toàn cháy cho nhà và công trình', 
      description: 'Quy định về phòng cháy chữa cháy, thoát nạn.',
      category: 'Fire Safety',
      full_text: 'Quy chuẩn này quy định các yêu cầu chung về an toàn cháy cho gian phòng, nhà và công trình và bắt buộc áp dụng trong tất cả các giai đoạn xây dựng mới, cải tạo, sửa chữa...',
      effective_date: '2023-01-16'
    },
    { 
      id: 'REG-003', 
      code: 'TCVN 4449:1987', 
      title: 'Quy hoạch xây dựng đô thị - Tiêu chuẩn thiết kế', 
      description: 'Tiêu chuẩn thiết kế quy hoạch đô thị.',
      category: 'Planning',
      full_text: 'Tiêu chuẩn này áp dụng để lập đồ án quy hoạch chung, quy hoạch chi tiết các đô thị, các khu chức năng đô thị...',
      effective_date: '1987-01-01'
    },
    { 
      id: 'REG-004', 
      code: 'TCVN 9386:2012', 
      title: 'Thiết kế công trình chịu động đất', 
      description: 'Tiêu chuẩn thiết kế kháng chấn cho công trình.',
      category: 'Structure',
      full_text: 'Tiêu chuẩn này quy định các yêu cầu thiết kế và quy tắc thực hành cho các công trình xây dựng trong vùng có động đất...',
      effective_date: '2012-01-01'
    },
    { 
      id: 'REG-005', 
      code: 'Luật Xây dựng 2014', 
      title: 'Luật Xây dựng số 50/2014/QH13', 
      description: 'Văn bản luật cao nhất điều chỉnh hoạt động xây dựng.',
      category: 'Legal',
      full_text: 'Luật này quy định về quyền, nghĩa vụ, trách nhiệm của cơ quan, tổ chức, cá nhân và quản lý nhà nước trong hoạt động đầu tư xây dựng...',
      effective_date: '2015-01-01'
    },
    { 
      id: 'REG-006', 
      code: 'TCVN 2737:2023', 
      title: 'Tải trọng và tác động - Tiêu chuẩn thiết kế', 
      description: 'Tiêu chuẩn mới nhất về tính toán tải trọng công trình.',
      category: 'Structure',
      full_text: 'Tiêu chuẩn này quy định các yêu cầu về tải trọng và tác động dùng để thiết kế các kết cấu xây dựng, nền móng nhà và công trình...',
      effective_date: '2023-06-01'
    },
    { 
      id: 'REG-007', 
      code: 'QCVN 07:2016/BXD', 
      title: 'Quy chuẩn kỹ thuật quốc gia Các công trình hạ tầng kỹ thuật', 
      description: 'Quy chuẩn về hạ tầng kỹ thuật đô thị.',
      category: 'Infrastructure',
      full_text: 'Quy chuẩn này quy định các yêu cầu kỹ thuật và quản lý bắt buộc phải tuân thủ khi lập, thẩm định, phê duyệt các dự án đầu tư xây dựng hạ tầng kỹ thuật...',
      effective_date: '2016-05-01'
    },
    { 
      id: 'REG-008', 
      code: 'TCVN 10304:2014', 
      title: 'Móng cọc - Tiêu chuẩn thiết kế', 
      description: 'Tiêu chuẩn thiết kế móng cọc cho nhà và công trình.',
      category: 'Structure',
      full_text: 'Tiêu chuẩn này áp dụng để thiết kế móng cọc của nhà và công trình xây dựng mới hoặc cải tạo...',
      effective_date: '2014-01-01'
    },
  ];

  const insertReg = db.prepare("INSERT INTO regulations (id, code, title, description, category, full_text, effective_date) VALUES (?, ?, ?, ?, ?, ?, ?)");
  for (const reg of initialRegs) {
    insertReg.run(reg.id, reg.code, reg.title, reg.description, reg.category, reg.full_text, reg.effective_date);
  }
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '150mb' }));
  app.use(express.urlencoded({ limit: '150mb', extended: true }));
  const PORT = 3000;

  // API Routes
  app.use("/uploads", express.static(uploadDir));

  app.post("/api/upload", upload.single("file"), (req, res) => {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }
    const { project_id, category } = req.body;
    const file = req.file;
    
    const fileId = `FILE-${Math.floor(Math.random() * 100000)}`;
    const fileUrl = `/uploads/${file.filename}`;
    const format = path.extname(file.originalname).slice(1);

    db.prepare(`
      INSERT INTO files (id, project_id, name, category, format, url)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(fileId, project_id, file.originalname, category || "Other", format, fileUrl);

    res.json({ success: true, fileId, url: fileUrl });
  });

  app.get("/api/files/:id/content", (req, res) => {
    const file = db.prepare("SELECT * FROM files WHERE id = ?").get(req.params.id) as any;
    if (!file || !file.url) {
      return res.status(404).json({ error: "File not found" });
    }
    
    const filePath = path.join(process.cwd(), file.url);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: "Physical file not found" });
    }
    
    const content = fs.readFileSync(filePath);
    const base64 = content.toString('base64');
    res.json({ base64, mimeType: `application/${file.format}` });
  });

  app.get("/api/projects", (req, res) => {
    const projects = db.prepare("SELECT * FROM projects ORDER BY created_at DESC").all();
    res.json(projects);
  });

  app.post("/api/projects", (req, res) => {
    const { id, name, type, location, investor, designer, status, progress } = req.body;
    db.prepare(`
      INSERT INTO projects (id, name, type, location, investor, designer, status, progress)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, name, type, location, investor, designer, status || 'Concept', progress || 0);
    res.json({ success: true });
  });

  app.get("/api/projects/:id", (req, res) => {
    const project = db.prepare("SELECT * FROM projects WHERE id = ?").get(req.params.id);
    const files = db.prepare("SELECT * FROM files WHERE project_id = ?").all(req.params.id);
    const results = db.prepare("SELECT * FROM check_results WHERE project_id = ?").all(req.params.id);
    const boq = db.prepare("SELECT * FROM boq_items WHERE project_id = ?").all(req.params.id);
    const progress_updates = db.prepare("SELECT * FROM progress_updates WHERE project_id = ? ORDER BY created_at DESC").all(req.params.id);
    const bim_components = db.prepare("SELECT * FROM bim_components WHERE project_id = ?").all(req.params.id);
    res.json({ ...project, files, results, boq, progress_updates, bim_components });
  });

  app.post("/api/projects/:id/bim-components", (req, res) => {
    const { id } = req.params;
    const components = req.body; // Array of components
    
    const insert = db.prepare(`
      INSERT INTO bim_components (id, project_id, category, type, name, properties)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    
    const transaction = db.transaction((items) => {
      for (const item of items) {
        const componentId = `BIM-${Math.random().toString(36).substr(2, 9)}`;
        insert.run(componentId, id, item.category, item.type, item.name, JSON.stringify(item.properties));
      }
    });
    
    transaction(components);
    res.json({ success: true });
  });

  app.post("/api/projects/:id/progress", (req, res) => {
    const { id } = req.params;
    const { photo_url, completion_percentage, deviations, analysis_summary } = req.body;
    const updateId = `PROG-${Math.random().toString(36).substr(2, 9)}`;
    
    db.prepare(`
      INSERT INTO progress_updates (id, project_id, photo_url, completion_percentage, deviations, analysis_summary)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(updateId, id, photo_url, completion_percentage, JSON.stringify(deviations), analysis_summary);
    
    // Update project overall progress
    db.prepare("UPDATE projects SET progress = ? WHERE id = ?").run(completion_percentage, id);
    
    res.json({ success: true, id: updateId });
  });

  app.post("/api/projects/:id/boq", (req, res) => {
    const { id } = req.params;
    const items = req.body; // Array of BOQ items
    
    const deleteStmt = db.prepare("DELETE FROM boq_items WHERE project_id = ?");
    const insertStmt = db.prepare(`
      INSERT INTO boq_items (id, project_id, item_name, description, unit, quantity, rate, amount, category)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    const transaction = db.transaction((items) => {
      deleteStmt.run(id);
      for (const item of items) {
        insertStmt.run(
          item.id || `BOQ-${Math.random().toString(36).substr(2, 9)}`,
          id,
          item.item_name,
          item.description,
          item.unit,
          item.quantity,
          item.rate || 0,
          (item.quantity * (item.rate || 0)) || 0,
          item.category
        );
      }
    });
    
    transaction(items);
    res.json({ success: true });
  });

  app.post("/api/files", (req, res) => {
    const { id, project_id, name, category, format, url } = req.body;
    db.prepare(`
      INSERT INTO files (id, project_id, name, category, format, url)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(id, project_id, name, category, format, url);
    res.json({ success: true });
  });

  app.post("/api/check-results", (req, res) => {
    const { id, project_id, module, check_item, status, issue_description, suggested_fix } = req.body;
    db.prepare(`
      INSERT INTO check_results (id, project_id, module, check_item, status, issue_description, suggested_fix)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(id, project_id, module, check_item, status, issue_description, suggested_fix);
    res.json({ success: true });
  });

  app.get("/api/regulations", (req, res) => {
    const regs = db.prepare("SELECT * FROM regulations").all();
    res.json(regs);
  });

  app.get("/api/chat-messages", (req, res) => {
    const messages = db.prepare("SELECT * FROM chat_messages ORDER BY created_at ASC").all();
    res.json(messages);
  });

  app.post("/api/chat-messages", (req, res) => {
    const { role, text } = req.body;
    db.prepare("INSERT INTO chat_messages (role, text) VALUES (?, ?)").run(role, text);
    res.json({ success: true });
  });

  app.post("/api/projects/:id/analyze", (req, res) => {
    const { id } = req.params;
    const results = db.prepare("SELECT status FROM check_results WHERE project_id = ?").all(id) as { status: string }[];
    
    if (results.length === 0) {
      return res.json({ success: true, compliance_score: 100, risk_level: 'Low' });
    }

    const total = results.length;
    const okCount = results.filter(r => r.status === 'OK').length;
    const score = Math.round((okCount / total) * 100);
    
    let risk: 'Low' | 'Medium' | 'High' = 'Low';
    if (score < 60) risk = 'High';
    else if (score < 85) risk = 'Medium';

    db.prepare("UPDATE projects SET compliance_score = ?, risk_level = ? WHERE id = ?").run(score, risk, id);
    
    res.json({ success: true, compliance_score: score, risk_level: risk });
  });

  app.post("/api/chat-messages/clear", (req, res) => {
    db.prepare("DELETE FROM chat_messages").run();
    res.json({ success: true });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static("dist"));
    app.get("*", (req, res) => {
      res.sendFile(path.resolve("dist/index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
