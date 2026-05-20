import LessonCard from '../../components/LessonCard';
import CodeTabs from '../../components/CodeTabs';
import LineTable from '../../components/LineTable';
import ExerciseSection from '../../components/ExerciseSection';
import Callout from '../../components/Callout';
import { Sec, Flow } from './_helpers';

const NAMED = `// math.ts — named exports
export function add(a: number, b: number): number {
  return a + b;
}
export function multiply(a: number, b: number): number {
  return a * b;
}
export const PI: number = 3.14159;

// Import ở file khác:
import { add, PI } from './math';           // named
import { add as sum } from './math';        // alias
import * as MathUtils from './math';        // namespace`;

const DEFAULT_CODE = `// user.service.ts — default export + named exports
export interface IUser {
  id: string;
  name: string;
  email: string;
}

// type-only export — không tạo JS runtime code
export type CreateUserInput = Omit<IUser, 'id'>;

class UserService {
  async findAll(): Promise<IUser[]>               { return []; }
  async findById(id: string): Promise<IUser|null> { return null; }
  async create(input: CreateUserInput): Promise<IUser> {
    return { id: Date.now().toString(), ...input };
  }
}

export default UserService; // 1 file chỉ có 1 default export`;

const IMPORT_CODE = `// Các pattern import quan trọng
import UserService from './user.service';          // default
import { IUser, CreateUserInput } from './user.service'; // named
import type { IUser } from './user.service';        // type-only (không vào JS output)

// Best practice: dùng 'import type' cho interfaces/types
import type { Request, Response, NextFunction } from 'express';

// Barrel export — re-export từ 1 nơi (src/models/index.ts)
export { User }        from './User';
export { Post }        from './Post';
export type { IUser }  from './User';
export type { IPost }  from './Post';

// Import từ barrel:
import { User, Post } from './models'; // gọn hơn import từng file`;

const JSOTS = `// CommonJS (Node.js cũ) vs ESM (TypeScript chuẩn)

// CommonJS — require/module.exports:
const express = require('express');
const { Router } = require('express');
module.exports = { userRouter };

// ESM với TypeScript:
import express, { Router } from 'express';
export { userRouter };
export function helperFn() {}

// Tại sao ESM tốt hơn với TypeScript:
// ✅ Import type — chỉ tồn tại trong TS, bị xóa khỏi JS output
// ✅ Tree shaking — bundler loại bỏ code không dùng
// ✅ Static analysis — IDE biết chính xác export gì`;

interface Props {
  isDone: boolean;
  onToggleDone: () => void;
}

export default function Lesson13({ isDone, onToggleDone }: Props) {
  return (
    <LessonCard
      id="lesson-01-13"
      num="13"
      title="ESM modules với TypeScript — import/export chuẩn"
      desc="named exports, default export, import type, barrel exports"
      priority="high"
      isDone={isDone}
      onToggleDone={onToggleDone}
    >
      <Sec title="Khái niệm">
        <p>
          TypeScript dùng <strong>ESM</strong> (ECMAScript Modules) với{' '}
          <code className="ic">import</code>/<code className="ic">export</code>. Không dùng{' '}
          <code className="ic">require()</code>. Điểm mạnh của TS:{' '}
          <code className="ic">import type</code> — chỉ import type, không tạo JS runtime code, giảm
          bundle size.
        </p>
      </Sec>

      <Sec title="Luồng hoạt động">
        <Flow
          steps={[
            'Named export: export function fn() — có thể export nhiều thứ từ 1 file',
            'Default export: export default ClassName — mỗi file chỉ 1 default',
            'Import type: import type { IUser } — bị xóa hoàn toàn khỏi JS output',
            'Barrel export: index.ts re-export từ nhiều files → import từ 1 nơi',
          ]}
        />
      </Sec>

      <Sec title="Code ví dụ">
        <CodeTabs
          tabs={[
            { label: 'Named exports', code: NAMED },
            { label: 'Default export', code: DEFAULT_CODE },
            { label: 'Import patterns', code: IMPORT_CODE },
            { label: 'So sánh JS→TS', code: JSOTS },
          ]}
        />
      </Sec>

      <Sec title="Giải thích từng dòng">
        <LineTable
          rows={[
            {
              line: 'export function',
              explanation: 'Named export — import bằng { add }, có thể rename khi import',
            },
            {
              line: 'export type',
              explanation: 'Type-only export — không tạo JS code, chỉ dùng cho type checking',
            },
            {
              line: 'export default',
              explanation: 'Default export — import không cần { }, tên import tự chọn',
            },
            {
              line: 'import type',
              explanation:
                'Best practice: dùng cho interfaces/types — compiler xóa hoàn toàn khỏi output',
            },
            {
              line: 'barrel export',
              explanation:
                'Re-export từ index.ts — import { User, Post } từ 1 nơi thay vì nhiều file',
            },
          ]}
        />
      </Sec>

      <Sec title="Lỗi thường gặp">
        <Callout type="warn">
          <strong>Import không có extension:</strong> TypeScript import không cần đuôi file:{' '}
          <code className="ic">
            import {'{'} fn {'}'} from './utils'
          </code>
          . Nhưng khi dùng ESM native, cần <code className="ic">./utils.js</code>. Với CommonJS
          output thì không cần lo.
        </Callout>
        <Callout type="note">
          <strong>Circular imports:</strong> A import B, B import A → circular dependency. Giải
          pháp: tách shared types ra file riêng (<code className="ic">src/types/index.ts</code>), cả
          A và B import từ đó.
        </Callout>
      </Sec>

      <Sec title="Bài tập thực hành">
        <ExerciseSection
          exercises={[
            {
              level: 'basic',
              text: 'Tạo file utils/math.ts với 4 named exports: add, subtract, multiply, divide. Import và dùng trong index.ts.',
            },
            {
              level: 'medium',
              text: 'Tạo barrel export: models/index.ts re-export User, Post, Comment. Import { User, Post } từ "./models".',
            },
            {
              level: 'hard',
              text: 'Tạo src/types/index.ts chứa IUser, IPost, IComment, ApiResponse<T>. Dùng "import type" để import vào các files khác. Đảm bảo không có circular dependency.',
            },
          ]}
          hint='Barrel export: export { User } from "./User"; export type { IUser } from "./User". Kiểm tra circular: tsc --noEmit và đọc kỹ lỗi.'
        />
      </Sec>
    </LessonCard>
  );
}
