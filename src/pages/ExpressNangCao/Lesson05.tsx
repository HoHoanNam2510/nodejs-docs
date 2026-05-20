import LessonCard from '../../components/LessonCard';
import CodeTabs from '../../components/CodeTabs';
import LineTable from '../../components/LineTable';
import ExerciseSection from '../../components/ExerciseSection';
import Callout from '../../components/Callout';
import { Sec, Flow } from './_helpers';

interface Props {
  isDone: boolean;
  onToggleDone: () => void;
}

const BASIC = `import multer, { FileFilterCallback } from 'multer';
import { Request } from 'express';
import path from 'path';

// Storage: lưu vào disk
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, 'uploads/'),
  filename:    (_req, file, cb) => {
    const ext      = path.extname(file.originalname);
    const basename = path.basename(file.originalname, ext);
    cb(null, \`\${basename}-\${Date.now()}\${ext}\`);
  },
});

// File filter: chỉ nhận ảnh
const imageFilter = (
  _req: Request,
  file: Express.Multer.File, // type từ @types/multer
  cb:   FileFilterCallback
) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);  // chấp nhận
  } else {
    cb(null, false); // từ chối (không throw error)
  }
};

const upload = multer({
  storage,
  fileFilter: imageFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

// Route: single file
app.post('/upload', upload.single('avatar'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  // req.file: Express.Multer.File — typed!
  res.json({ filename: req.file.filename, size: req.file.size });
});`;

const REAL = `import multer, { FileFilterCallback, StorageEngine } from 'multer';
import { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';

// Đảm bảo thư mục tồn tại
const UPLOAD_DIR = 'uploads/avatars';
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

// ── Storage với typed filenames ───────────────────────────────────────────────

const avatarStorage: StorageEngine = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
  filename:    (req: Request, file: Express.Multer.File, cb) => {
    // Dùng user ID (từ req.user sau khi auth) thay vì tên file gốc
    const userId  = (req as any).user?.id || 'unknown';
    const ext     = path.extname(file.originalname).toLowerCase();
    cb(null, \`avatar-\${userId}-\${Date.now()}\${ext}\`);
  },
});

// ── File filter typed ─────────────────────────────────────────────────────────

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

const avatarFilter = (
  _req: Request,
  file: Express.Multer.File,
  cb:   FileFilterCallback
): void => {
  if (ALLOWED_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(\`File type \${file.mimetype} không được phép\`));
  }
};

// ── Upload instances ──────────────────────────────────────────────────────────

export const uploadAvatar = multer({
  storage:    avatarStorage,
  fileFilter: avatarFilter,
  limits:     { fileSize: 2 * 1024 * 1024 }, // 2MB
}).single('avatar');

// ── Route handler ─────────────────────────────────────────────────────────────

// PUT /users/me/avatar
router.put('/me/avatar', authenticate, (req: Request, res: Response) => {
  uploadAvatar(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ error: 'File quá lớn (tối đa 2MB)' });
      }
      return res.status(400).json({ error: err.message });
    }
    if (err) return res.status(400).json({ error: (err as Error).message });
    if (!req.file) return res.status(400).json({ error: 'Chưa chọn file' });

    res.json({
      success:  true,
      filename: req.file.filename,
      url:      \`/uploads/avatars/\${req.file.filename}\`,
    });
  });
});`;

const MISTAKE = `// ❌ Sai lầm 1: Lưu tên file gốc trực tiếp — path traversal risk
filename: (_req, file, cb) => cb(null, file.originalname)
// Nếu user upload file tên "../../app.ts" → có thể overwrite source code!

// ✅ Đúng: Generate tên file an toàn
filename: (_req, file, cb) => {
  const ext  = path.extname(file.originalname);
  const safe = crypto.randomUUID(); // random, không đoán được
  cb(null, safe + ext);
}

// ❌ Sai lầm 2: Không check req.file sau single upload
app.post('/upload', upload.single('photo'), (req, res) => {
  res.json({ url: req.file.filename }); // TypeError nếu user không gửi file!
});

// ✅ Đúng: check req.file trước khi dùng
app.post('/upload', upload.single('photo'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'File bắt buộc' });
  res.json({ url: req.file.filename }); // safe
});

// ❌ Sai lầm 3: Không limit file size — DoS attack
const upload = multer({ storage }); // không có limits → user upload 1GB file được

// ✅ Đúng: luôn set limits
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });`;

export default function Lesson05({ isDone, onToggleDone }: Props) {
  return (
    <LessonCard
      id="lesson-03-05"
      num="05"
      title="File upload với multer và @types/multer"
      desc="Express.Multer.File, FileFilterCallback, diskStorage, size limits"
      priority="medium"
      isDone={isDone}
      onToggleDone={onToggleDone}
    >
      <Sec title="Khái niệm">
        <code>multer</code> là middleware xử lý <code>multipart/form-data</code> — chuẩn dùng để
        upload file qua HTML form hoặc FormData API. Package <code>@types/multer</code> cung cấp
        type <code>Express.Multer.File</code> (thông tin về file đã upload) và{' '}
        <code>FileFilterCallback</code> (callback quyết định chấp nhận/từ chối file). Sau khi
        middleware chạy, <code>req.file</code> (single) hoặc <code>req.files</code> (multiple) chứa
        thông tin file.
      </Sec>

      <Sec title="Luồng hoạt động">
        <Flow
          steps={[
            'Client gửi POST với Content-Type: multipart/form-data (FormData)',
            'multer parse body → gọi fileFilter — quyết định chấp nhận hay từ chối',
            'Nếu chấp nhận → gọi storage.filename → xác định tên file lưu',
            'Lưu file vào disk (diskStorage) hoặc memory (memoryStorage)',
            'Gán req.file với metadata: fieldname, originalname, filename, path, size, mimetype',
          ]}
        />
      </Sec>

      <Sec title="Code ví dụ">
        <CodeTabs
          tabs={[
            { label: 'Cơ bản .ts', code: BASIC },
            { label: 'Thực tế .ts', code: REAL },
            { label: 'Sai lầm .ts', code: MISTAKE },
          ]}
        />
      </Sec>

      <Sec title="Giải thích từng dòng">
        <LineTable
          rows={[
            {
              line: '1',
              explanation:
                'Express.Multer.File — type cho file đã upload. Các fields quan trọng: fieldname (tên input), originalname (tên gốc), filename (tên đã lưu), path (đường dẫn), size (bytes), mimetype.',
            },
            {
              line: '2',
              explanation:
                'FileFilterCallback — (error: Error | null, acceptFile: boolean) => void. Pass null, true để accept. Pass null, false để reject không lỗi. Pass new Error() để reject với lỗi.',
            },
            {
              line: '3',
              explanation:
                'limits: { fileSize: 5 * 1024 * 1024 } — giới hạn 5MB. Multer sẽ reject file lớn hơn với MulterError code LIMIT_FILE_SIZE. Luôn set giới hạn để ngăn DoS.',
            },
            {
              line: '4',
              explanation:
                'upload.single("avatar") — field name "avatar" phải khớp với formData.append("avatar", file) ở client. Sau middleware, req.file là Express.Multer.File | undefined.',
            },
            {
              line: '5',
              explanation:
                'err instanceof multer.MulterError — check loại lỗi. MulterError có code: LIMIT_FILE_SIZE, LIMIT_FILE_COUNT, LIMIT_UNEXPECTED_FILE... Xử lý riêng cho từng code.',
            },
          ]}
        />
      </Sec>

      <Sec title="Lỗi thường gặp">
        <Callout type="warn">
          Không bao giờ lưu <code>file.originalname</code> trực tiếp làm tên file trên server — có
          thể chứa ký tự nguy hiểm hoặc path traversal (<code>../../etc/passwd</code>). Luôn
          generate tên an toàn: <code>crypto.randomUUID()</code> + extension.
        </Callout>
        <Callout type="note">
          Cho production, dùng cloud storage (S3, Cloudinary) thay diskStorage — server stateless và
          không mất file khi redeploy. <code>multer-s3</code> và{' '}
          <code>multer-storage-cloudinary</code>
          đều có TypeScript types tốt.
        </Callout>
      </Sec>

      <Sec title="Bài tập thực hành">
        <ExerciseSection
          exercises={[
            {
              level: 'basic',
              text: 'Thêm POST /todos/import nhận file CSV (text/csv). Đọc file content từ req.file.buffer (dùng memoryStorage). Parse CSV thành array of todos.',
            },
            {
              level: 'medium',
              text: 'Viết upload middleware cho nhiều loại: avatarUpload (ảnh, 2MB), documentUpload (pdf/doc, 10MB), imageGallery (tối đa 5 ảnh). Mỗi loại có storage và filter riêng.',
            },
            {
              level: 'hard',
              text: 'Integrate multer với sharp để resize ảnh trước khi lưu: nhận file → buffer với memoryStorage → resize xuống 400x400 → lưu vào disk. Dùng multer callback pattern (không middleware) để xử lý sau khi có buffer.',
            },
          ]}
          hint="memoryStorage không cần đường dẫn — multer.memoryStorage(). File sẽ có buffer property thay vì path. Thích hợp khi cần xử lý file (resize, parse) trước khi lưu."
        />
      </Sec>
    </LessonCard>
  );
}
