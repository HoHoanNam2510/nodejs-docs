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

const BASIC = `import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../utils/jwt';

// --- TokenPair interface ---
interface TokenPair {
  accessToken:  string; // 15 phút — dùng để gọi API
  refreshToken: string; // 7 ngày  — dùng để lấy access token mới
}

// --- Generate cả 2 tokens ---
export const generateTokenPair = (userId: string, role: 'user' | 'admin'): TokenPair => ({
  accessToken:  signAccessToken({ userId, role }),
  refreshToken: signRefreshToken({ userId, role }),
});

// --- Dùng trong login và register ---
const tokens: TokenPair = generateTokenPair(user._id.toString(), user.role);

// --- Refresh endpoint ---
export const refreshTokens = asyncHandler(async (req: Request, res: Response) => {
  // Đọc refresh token từ cookie (đã lưu khi login)
  const refreshToken: string | undefined = req.cookies.refreshToken;
  if (!refreshToken) throw new AppError('Refresh token không tìm thấy', 401);

  // Verify refresh token — dùng REFRESH_SECRET (khác với access secret)
  const payload = verifyRefreshToken(refreshToken);

  // Confirm user vẫn tồn tại
  const user = await User.findById(payload.userId);
  if (!user) throw new AppError('User không tồn tại', 401);

  // Issue new token pair
  const tokens = generateTokenPair(user._id.toString(), user.role);

  // Set new refresh token cookie
  res.cookie('refreshToken', tokens.refreshToken, {
    httpOnly: true,
    secure:   process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge:   7 * 24 * 60 * 60 * 1000,
    path:     '/auth/refresh',
  });

  res.json({ success: true, data: { accessToken: tokens.accessToken } });
});`;

const REAL = `// src/controllers/auth.controller.ts — refresh token với DB storage

import { RefreshToken } from '../models/RefreshToken'; // Mongoose model để lưu tokens

// --- Model RefreshToken (lưu trong DB để có thể revoke) ---
export interface IRefreshToken {
  token:     string;
  userId:    Types.ObjectId;
  expiresAt: Date;
  createdAt: Date;
}

const refreshTokenSchema = new Schema<IRefreshToken>({
  token:     { type: String, required: true, unique: true },
  userId:    { type: Schema.Types.ObjectId, ref: 'User', required: true },
  expiresAt: { type: Date, required: true },
});

// TTL index — MongoDB tự xóa expired tokens
refreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const RefreshToken = model<IRefreshToken>('RefreshToken', refreshTokenSchema);

// --- Login: lưu refresh token vào DB ---
export const login = asyncHandler(async (req, res) => {
  // ... verify credentials ...
  const tokens = generateTokenPair(user._id.toString(), user.role);

  // Lưu refresh token vào DB
  await RefreshToken.create({
    token:     tokens.refreshToken,
    userId:    user._id,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 ngày
  });

  res.cookie('refreshToken', tokens.refreshToken, { httpOnly: true, ... });
  res.json({ success: true, data: { accessToken: tokens.accessToken } });
});

// --- Refresh: verify DB + issue new pair ---
export const refreshTokens = asyncHandler(async (req, res) => {
  const oldRefreshToken: string = req.cookies.refreshToken;
  if (!oldRefreshToken) throw new AppError('Không tìm thấy refresh token', 401);

  // Verify JWT và kiểm tra trong DB (có thể đã bị revoke)
  const payload = verifyRefreshToken(oldRefreshToken);
  const storedToken = await RefreshToken.findOne({ token: oldRefreshToken });
  if (!storedToken) throw new AppError('Refresh token đã bị thu hồi', 401);

  // Xóa token cũ (token rotation — mỗi refresh cấp token mới)
  await storedToken.deleteOne();

  const user = await User.findById(payload.userId);
  if (!user) throw new AppError('User không tồn tại', 401);

  const tokens = generateTokenPair(user._id.toString(), user.role);

  // Lưu refresh token mới
  await RefreshToken.create({
    token:     tokens.refreshToken,
    userId:    user._id,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  });

  res.cookie('refreshToken', tokens.refreshToken, { httpOnly: true, ... });
  res.json({ success: true, data: { accessToken: tokens.accessToken } });
});

// --- Logout: xóa refresh token khỏi DB ---
export const logout = asyncHandler(async (req, res) => {
  const refreshToken: string = req.cookies.refreshToken;
  if (refreshToken) {
    await RefreshToken.deleteOne({ token: refreshToken });
  }
  res.clearCookie('refreshToken', { path: '/auth/refresh' });
  res.json({ success: true, message: 'Đăng xuất thành công' });
});`;

const MISTAKE = `// ❌ Sai lầm 1: Dùng cùng secret cho access và refresh token
const signAccessToken  = (p: JwtPayload) => jwt.sign(p, process.env.JWT_SECRET!);
const signRefreshToken = (p: JwtPayload) => jwt.sign(p, process.env.JWT_SECRET!); // NGUY HIỂM!
// Refresh token có thể dùng như access token nếu cùng secret + payload

// ✅ Dùng 2 secrets riêng — chỉ access endpoint nhận access token
const signAccessToken  = (p) => jwt.sign(p, process.env.JWT_SECRET!, { expiresIn: '15m' });
const signRefreshToken = (p) => jwt.sign(p, process.env.JWT_REFRESH_SECRET!, { expiresIn: '7d' });

// ❌ Sai lầm 2: Không revoke refresh token khi logout
export const logout = (req, res) => {
  res.clearCookie('refreshToken');
  res.json({ success: true }); // refresh token vẫn còn hợp lệ trong DB/memory!
};

// ✅ Xóa khỏi DB khi logout
export const logout = asyncHandler(async (req, res) => {
  const rt = req.cookies.refreshToken;
  if (rt) await RefreshToken.deleteOne({ token: rt });
  res.clearCookie('refreshToken', { path: '/auth/refresh' });
  res.json({ success: true });
});

// ❌ Sai lầm 3: Không implement token rotation — reuse refresh token vô hạn
// Nếu attacker đánh cắp refresh token → dùng mãi cho đến khi hết hạn 7 ngày

// ✅ Token rotation: mỗi lần refresh → xóa old token, tạo new token
// Nếu old token bị dùng lần 2 → không tồn tại trong DB → reject → force login`;

export default function Lesson07({ isDone, onToggleDone }: Props) {
  return (
    <LessonCard
      id="lesson-06-07"
      num="07"
      title="Refresh token pattern"
      desc="TokenPair interface, generateTokenPair, token rotation, lưu refresh token trong DB"
      priority="high"
      isDone={isDone}
      onToggleDone={onToggleDone}
    >
      <Sec title="Khái niệm">
        Refresh token pattern giải quyết tension giữa <strong>security</strong> (token ngắn hạn — ít
        rủi ro) và <strong>UX</strong> (không muốn user login lại thường xuyên). Access token ngắn
        (15 phút): nếu bị đánh cắp, chỉ dùng được 15 phút. Refresh token dài (7 ngày): dùng để lấy
        access token mới — ít expose hơn (chỉ gọi endpoint /auth/refresh). Token rotation: mỗi lần
        refresh → refresh token cũ bị xóa, refresh token mới được cấp — chống tái sử dụng.
      </Sec>

      <Sec title="Luồng hoạt động">
        <Flow
          steps={[
            'Login thành công → cấp accessToken (15m) + refreshToken (7d)',
            'Client dùng accessToken cho mọi API calls. Lưu trong memory (không localStorage)',
            'accessToken hết hạn → API trả 401 với error code TOKEN_EXPIRED',
            'Client gọi POST /auth/refresh với refreshToken (cookie hoặc body)',
            'Server verify refreshToken → issue accessToken mới (và refreshToken mới nếu rotation)',
            'Client tiếp tục dùng accessToken mới — user không biết có refresh',
          ]}
        />
      </Sec>

      <Sec title="Code ví dụ">
        <CodeTabs
          tabs={[
            { label: 'Cơ bản .ts', code: BASIC },
            { label: 'Thực tế (DB storage) .ts', code: REAL },
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
                'interface TokenPair: { accessToken, refreshToken }. Typed return type của generateTokenPair — caller biết chính xác nhận được gì. Dùng ở cả login, register, và refresh endpoint.',
            },
            {
              line: '2',
              explanation:
                'generateTokenPair(userId, role): encapsulate logic tạo 2 tokens — không lặp code ở login và register. Nhận userId string (không ObjectId) và role literal type — type-safe.',
            },
            {
              line: '3',
              explanation:
                'refreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }): TTL index — MongoDB tự xóa documents khi expiresAt < current time. Tự động cleanup tokens hết hạn, không cần cron job.',
            },
            {
              line: '4',
              explanation:
                'Token rotation: await storedToken.deleteOne() trước khi tạo token mới. Nếu cùng refresh token được dùng lần 2 (detect theft): findOne trả null → reject → đây là signal có breach → có thể invalidate tất cả sessions của user.',
            },
          ]}
        />
      </Sec>

      <Sec title="Lỗi thường gặp">
        <Callout type="warn">
          Không bao giờ dùng chung secret cho access token và refresh token. Nếu dùng chung, kẻ tấn
          công có refresh token (dài hạn) có thể dùng như access token (không cần call
          /auth/refresh). Dùng 2 env vars riêng: <code>JWT_SECRET</code> và{' '}
          <code>JWT_REFRESH_SECRET</code>.
        </Callout>
        <Callout type="note">
          <strong>Token rotation detect theft</strong>: nếu attacker đánh cắp refresh token và dùng
          trước victim, rotation có thể phát hiện. Khi victim dùng refresh token cũ (đã bị rotate) →
          không tìm thấy trong DB → đây là dấu hiệu token bị compromise → invalidate tất cả refresh
          tokens của user đó (force logout toàn bộ sessions).
        </Callout>
      </Sec>

      <Sec title="Bài tập thực hành">
        <ExerciseSection
          exercises={[
            {
              level: 'basic',
              text: 'Implement generateTokenPair(userId, role): TokenPair với 2 functions signAccessToken (15m) và signRefreshToken (7d) dùng 2 secrets khác nhau. Test: verify access token bằng ACCESS_SECRET, verify refresh token bằng REFRESH_SECRET — chéo nhau phải fail.',
            },
            {
              level: 'medium',
              text: 'Tạo RefreshToken model với TTL index (expiresAt). Implement POST /auth/refresh: đọc cookie → findOne trong DB → verify → xóa old → tạo new pair → lưu new vào DB → set cookie + trả access token. Test full refresh flow.',
            },
            {
              level: 'hard',
              text: 'Implement theft detection trong rotation: khi refresh token đã bị rotate (không tìm thấy trong DB) → xóa TẤT CẢ refresh tokens của userId đó → trả 401 với message "Phát hiện đăng nhập bất thường — vui lòng đăng nhập lại". Client buộc phải login lại.',
            },
          ]}
          hint="TTL index trong Mongoose: schema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }). expireAfterSeconds: 0 nghĩa là xóa ngay khi expiresAt < current time (không đợi thêm). MongoDB background task chạy mỗi 60 giây để cleanup."
        />
      </Sec>
    </LessonCard>
  );
}
