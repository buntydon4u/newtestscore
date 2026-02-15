import * as xlsx from 'xlsx';
import { prisma } from '../config/database.js';
import { QuestionType, DifficultyLevel } from '@prisma/client';
import { AppError } from '../middleware/errorHandler.js';

type UploadOptions = {
  sectionName?: string;
  questionBankId?: string;
};

type ParsedQuestion = {
  questionBankId: string;
  topicId: string;
  subjectId?: string;
  questionType: QuestionType;
  questionText: string;
  correctAnswer?: any;
  marks: number;
  negativeMarks?: number;
  difficultyLevel?: DifficultyLevel;
  passageId?: string;
  mediaAssetId?: string;
  options?: Array<{
    optionNumber: number;
    optionText: string;
    isCorrect: boolean;
  }>;
  tags?: string[];
};

function normalizeHeader(header: string) {
  return header.trim().toLowerCase().replace(/[\s-]+/g, '_');
}

function normalizeRow(row: Record<string, any>) {
  const normalized: Record<string, any> = {};
  Object.entries(row).forEach(([key, value]) => {
    if (typeof key === 'string') {
      normalized[normalizeHeader(key)] = value;
    }
  });
  return normalized;
}

function parseRequiredString(value: any, field: string, rowNum: number) {
  const str = String(value ?? '').trim();
  if (!str) {
    throw new AppError(400, `Row ${rowNum}: ${field} is required`);
  }
  return str;
}

function parseOptionalString(value: any) {
  const str = String(value ?? '').trim();
  return str || undefined;
}

function parseNumber(value: any, field: string, rowNum: number, required: boolean, defaultValue?: number) {
  if (value === null || value === undefined || value === '') {
    if (required) {
      throw new AppError(400, `Row ${rowNum}: ${field} is required`);
    }
    return defaultValue;
  }
  const num = typeof value === 'number' ? value : Number(String(value).trim());
  if (Number.isNaN(num)) {
    throw new AppError(400, `Row ${rowNum}: ${field} must be a number`);
  }
  return num;
}

function parseQuestionType(value: any, rowNum: number) {
  const normalized = String(value ?? '')
    .trim()
    .toUpperCase()
    .replace(/[\s-]+/g, '_');

  if (!normalized) {
    throw new AppError(400, `Row ${rowNum}: question_type is required`);
  }

  if (!Object.values(QuestionType).includes(normalized as QuestionType)) {
    throw new AppError(
      400,
      `Row ${rowNum}: question_type must be one of ${Object.values(QuestionType).join(', ')}`
    );
  }

  return normalized as QuestionType;
}

function parseDifficulty(value: any, rowNum: number) {
  if (value === null || value === undefined || value === '') return undefined;
  const normalized = String(value).trim().toUpperCase();
  if (!Object.values(DifficultyLevel).includes(normalized as DifficultyLevel)) {
    throw new AppError(
      400,
      `Row ${rowNum}: difficulty_level must be one of ${Object.values(DifficultyLevel).join(', ')}`
    );
  }
  return normalized as DifficultyLevel;
}

function parseTags(value: any) {
  if (!value) return [];
  return String(value)
    .split(',')
    .map(t => t.trim())
    .filter(Boolean);
}

function parseCorrectOptions(value: any) {
  if (value === null || value === undefined || value === '') return [];
  const raw = String(value).trim();
  if (!raw) return [];

  return raw
    .split(/[,\s]+/)
    .map(token => token.trim())
    .filter(Boolean)
    .map(token => {
      if (/^[A-Za-z]$/.test(token)) {
        return token.toUpperCase().charCodeAt(0) - 64; // A -> 1
      }
      if (/^(TRUE|T)$/i.test(token)) return 1;
      if (/^(FALSE|F)$/i.test(token)) return 2;
      const num = parseInt(token, 10);
      return Number.isNaN(num) ? null : num;
    })
    .filter((n): n is number => typeof n === 'number');
}

function extractOptions(row: Record<string, any>, correctOptionNumbers: number[]) {
  const options: Array<{ optionNumber: number; optionText: string; isCorrect: boolean }> = [];
  for (let i = 1; i <= 6; i++) {
    const key = `option_${i}`;
    const value = row[key];
    if (value !== null && value !== undefined && String(value).trim() !== '') {
      options.push({
        optionNumber: i,
        optionText: String(value).trim(),
        isCorrect: correctOptionNumbers.includes(i)
      });
    }
  }
  return options;
}

export class ExamUploadService {
  async uploadCombinedPaper(examId: string, buffer: Buffer, options: UploadOptions, userId: string) {
    if (!buffer || buffer.length === 0) {
      throw new AppError(400, 'Excel file is required');
    }

    const workbook = xlsx.read(buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    if (!sheetName) {
      throw new AppError(400, 'Excel file has no sheets');
    }

    const sheet = workbook.Sheets[sheetName];
    const rawRows = xlsx.utils.sheet_to_json<Record<string, any>>(sheet, { defval: '' });
    if (!rawRows.length) {
      throw new AppError(400, 'Excel file has no data rows');
    }

    const questionInputs: ParsedQuestion[] = rawRows.map((raw, index) => {
      const rowNum = index + 2; // header is row 1
      const row = normalizeRow(raw);

      const questionText = parseRequiredString(row.question_text, 'question_text', rowNum);
      const questionType = parseQuestionType(row.question_type, rowNum);
      const marks = parseNumber(row.marks, 'marks', rowNum, true) as number;
      const negativeMarks = parseNumber(row.negative_marks, 'negative_marks', rowNum, false, 0);
      const topicId = parseRequiredString(row.topic_id, 'topic_id', rowNum);
      const questionBankId = parseRequiredString(
        row.question_bank_id || options.questionBankId,
        'question_bank_id',
        rowNum
      );
      const subjectId = parseOptionalString(row.subject_id);

      const difficultyLevel = parseDifficulty(row.difficulty_level, rowNum);
      const passageId = parseOptionalString(row.passage_id);
      const mediaAssetId = parseOptionalString(row.media_asset_id);

      const correctOptionNumbers = parseCorrectOptions(row.correct_option);
      let optionsList = extractOptions(row, correctOptionNumbers);

      if (questionType === QuestionType.TRUE_FALSE && optionsList.length === 0) {
        const correct = parseCorrectOptions(row.correct_answer);
        optionsList = [
          { optionNumber: 1, optionText: 'True', isCorrect: correct.includes(1) },
          { optionNumber: 2, optionText: 'False', isCorrect: correct.includes(2) }
        ];
      }

      if ((questionType === QuestionType.MCQ || questionType === QuestionType.MSQ || questionType === QuestionType.TRUE_FALSE) && optionsList.length === 0) {
        throw new AppError(400, `Row ${rowNum}: options are required for ${questionType}`);
      }

      if ((questionType === QuestionType.MCQ || questionType === QuestionType.MSQ || questionType === QuestionType.TRUE_FALSE) && !optionsList.some(o => o.isCorrect)) {
        throw new AppError(400, `Row ${rowNum}: correct_option is required for ${questionType}`);
      }

      const tags = parseTags(row.tags);
      const correctAnswer =
        questionType === QuestionType.MCQ || questionType === QuestionType.MSQ || questionType === QuestionType.TRUE_FALSE
          ? undefined
          : parseOptionalString(row.correct_answer);

      return {
        questionBankId,
        topicId,
        subjectId,
        questionType,
        questionText,
        correctAnswer,
        marks,
        negativeMarks,
        difficultyLevel,
        passageId,
        mediaAssetId,
        options: optionsList,
        tags
      };
    });

    const subjectIds = questionInputs.map(q => q.subjectId).filter(Boolean) as string[];
    const subjectWise = subjectIds.length > 0;

    if (subjectWise && subjectIds.length !== questionInputs.length) {
      throw new AppError(400, 'subject_id is required for all rows when using subject-wise upload');
    }

    const uniqueSubjectIds = Array.from(new Set(subjectIds));
    const uniqueTopicIds = Array.from(new Set(questionInputs.map(q => q.topicId)));

    let subjectMap = new Map<string, { id: string; name: string }>();
    if (subjectWise) {
      const subjects = await prisma.subject.findMany({
        where: { id: { in: uniqueSubjectIds } },
        select: { id: true, name: true }
      });

      if (subjects.length !== uniqueSubjectIds.length) {
        const found = new Set(subjects.map(s => s.id));
        const missing = uniqueSubjectIds.filter(id => !found.has(id));
        throw new AppError(400, `Unknown subject_id(s): ${missing.join(', ')}`);
      }

      subjectMap = new Map(subjects.map(s => [s.id, s]));

      const topics = await prisma.topic.findMany({
        where: { id: { in: uniqueTopicIds } },
        select: { id: true, subjectId: true }
      });

      const topicMap = new Map(topics.map(t => [t.id, t.subjectId]));
      for (const q of questionInputs) {
        if (q.subjectId && topicMap.get(q.topicId) !== q.subjectId) {
          throw new AppError(
            400,
            `topic_id ${q.topicId} does not belong to subject_id ${q.subjectId}`
          );
        }
      }
    }

    return prisma.$transaction(async (tx) => {
      const exam = await tx.exam.findUnique({
        where: { id: examId, isDeleted: false }
      });

      if (!exam) {
        throw new AppError(404, 'Exam not found');
      }

      if (subjectWise && uniqueSubjectIds.length > 0) {
        await tx.examSubject.createMany({
          data: uniqueSubjectIds.map(subjectId => ({ examId, subjectId })),
          skipDuplicates: true
        });
      }

      const totalMarks = questionInputs.reduce((sum, q) => sum + (q.marks || 0), 0);

      if (!subjectWise) {
        const section = await tx.section.create({
          data: {
            examId,
            sectionNumber: 1,
            name: options.sectionName || 'Combined Paper',
            timeAllotted: exam.duration,
            totalMarks,
            description: 'Uploaded via Excel'
          }
        });

        let questionOrder = 1;
        for (const input of questionInputs) {
          const { options: opts, tags, subjectId: _subjectId, ...questionData } = input;

          const question = await tx.question.create({
            data: {
              ...questionData,
              difficultyLevel: questionData.difficultyLevel || DifficultyLevel.MEDIUM,
              negativeMarks: questionData.negativeMarks ?? 0
            }
          });

          if (opts && opts.length > 0) {
            await tx.questionOption.createMany({
              data: opts.map(opt => ({
                questionId: question.id,
                optionNumber: opt.optionNumber,
                optionText: opt.optionText,
                isCorrect: opt.isCorrect
              }))
            });
          }

          if (tags && tags.length > 0) {
            for (const tagName of tags) {
              let tag = await tx.tag.findUnique({ where: { name: tagName } });
              if (!tag) {
                tag = await tx.tag.create({ data: { name: tagName } });
              }

              await tx.questionTag.create({
                data: {
                  questionId: question.id,
                  tagId: tag.id
                }
              });
            }
          }

          await tx.examQuestion.create({
            data: {
              examId,
              sectionId: section.id,
              questionId: question.id,
              questionOrder
            }
          });

          questionOrder += 1;
        }

        return {
          mode: 'COMBINED',
          sectionId: section.id,
          totalQuestions: questionInputs.length,
          totalMarks,
          sections: [
            {
              sectionId: section.id,
              name: section.name,
              totalQuestions: questionInputs.length,
              totalMarks
            }
          ]
        };
      }

      const grouped = new Map<string, ParsedQuestion[]>();
      for (const q of questionInputs) {
        const sid = q.subjectId as string;
        if (!grouped.has(sid)) grouped.set(sid, []);
        grouped.get(sid)!.push(q);
      }

      const sectionCount = grouped.size || 1;
      const baseTime = Math.max(1, Math.floor(exam.duration / sectionCount));

      const sectionsSummary: Array<{
        sectionId: string;
        subjectId: string;
        name: string;
        totalQuestions: number;
        totalMarks: number;
      }> = [];

      let sectionNumber = 1;
      for (const [subjectId, questions] of grouped.entries()) {
        const sectionTotalMarks = questions.reduce((sum, q) => sum + (q.marks || 0), 0);
        const subjectName = subjectMap.get(subjectId)?.name || subjectId;

        const section = await tx.section.create({
          data: {
            examId,
            sectionNumber,
            name: subjectName,
            timeAllotted: baseTime,
            totalMarks: sectionTotalMarks,
            description: 'Uploaded via Excel'
          }
        });

        let questionOrder = 1;
        for (const input of questions) {
          const { options: opts, tags, subjectId: _subjectId, ...questionData } = input;

          const question = await tx.question.create({
            data: {
              ...questionData,
              difficultyLevel: questionData.difficultyLevel || DifficultyLevel.MEDIUM,
              negativeMarks: questionData.negativeMarks ?? 0
            }
          });

          if (opts && opts.length > 0) {
            await tx.questionOption.createMany({
              data: opts.map(opt => ({
                questionId: question.id,
                optionNumber: opt.optionNumber,
                optionText: opt.optionText,
                isCorrect: opt.isCorrect
              }))
            });
          }

          if (tags && tags.length > 0) {
            for (const tagName of tags) {
              let tag = await tx.tag.findUnique({ where: { name: tagName } });
              if (!tag) {
                tag = await tx.tag.create({ data: { name: tagName } });
              }

              await tx.questionTag.create({
                data: {
                  questionId: question.id,
                  tagId: tag.id
                }
              });
            }
          }

          await tx.examQuestion.create({
            data: {
              examId,
              sectionId: section.id,
              questionId: question.id,
              questionOrder
            }
          });

          questionOrder += 1;
        }

        sectionsSummary.push({
          sectionId: section.id,
          subjectId,
          name: section.name,
          totalQuestions: questions.length,
          totalMarks: sectionTotalMarks
        });

        sectionNumber += 1;
      }

      return {
        mode: 'SUBJECT_WISE',
        totalQuestions: questionInputs.length,
        totalMarks,
        sections: sectionsSummary
      };
    }, { maxWait: 10000, timeout: 60000 });
  }
}

export const examUploadService = new ExamUploadService();
