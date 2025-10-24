import { Router, Request, Response } from 'express';
import multer from 'multer';
import multerS3 from 'multer-s3';
import { v4 as uuidv4 } from 'uuid';
import { s3Client, S3_CONFIG } from '../config/aws';
import { prisma } from '../index';
import { PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const router = Router();

// Configure multer for S3
const upload = multer({
  storage: multerS3({
    s3: s3Client,
    bucket: S3_CONFIG.bucketName,
    key: (req, file, cb) => {
      const userId = (req as any).user.id;
      const fileExtension = file.originalname.split('.').pop();
      const fileName = `${userId}/${uuidv4()}.${fileExtension}`;
      cb(null, fileName);
    },
    contentType: multerS3.AUTO_CONTENT_TYPE,
    metadata: (req, file, cb) => {
      cb(null, {
        userId: (req as any).user.id,
        originalName: file.originalname
      });
    }
  }),
  limits: {
    fileSize: S3_CONFIG.maxFileSize
  },
  fileFilter: (req, file, cb) => {
    if (S3_CONFIG.allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'));
    }
  }
});

// POST /api/files/upload - Upload file to S3
router.post('/upload', upload.single('file'), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file provided' });
    }

    const userId = (req as any).user.id;
    const s3File = req.file as any;

    // Save file metadata to database
    const fileRecord = await prisma.file.create({
      data: {
        filename: s3File.key,
        originalName: s3File.originalname,
        mimeType: s3File.mimetype,
        size: s3File.size,
        url: s3File.location,
        userId
      }
    });

    res.status(201).json({
      id: fileRecord.id,
      filename: fileRecord.filename,
      originalName: fileRecord.originalName,
      mimeType: fileRecord.mimeType,
      size: fileRecord.size,
      url: fileRecord.url,
      createdAt: fileRecord.createdAt
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Failed to upload file' });
  }
});

// GET /api/files - Get user's files
router.get('/', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    
    const files = await prisma.file.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });

    res.json(files);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch files' });
  }
});

// GET /api/files/:id - Get specific file
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user.id;

    const file = await prisma.file.findFirst({
      where: { id, userId }
    });

    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    }

    res.json(file);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch file' });
  }
});

// GET /api/files/:id/download - Get signed URL for file download
router.get('/:id/download', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user.id;

    const file = await prisma.file.findFirst({
      where: { id, userId }
    });

    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    }

    // Generate signed URL for download
    const command = new GetObjectCommand({
      Bucket: S3_CONFIG.bucketName,
      Key: file.filename
    });

    const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 }); // 1 hour

    res.json({ downloadUrl: signedUrl });
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate download URL' });
  }
});

// DELETE /api/files/:id - Delete file
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user.id;

    const file = await prisma.file.findFirst({
      where: { id, userId }
    });

    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    }

    // Delete from S3
    const deleteCommand = new DeleteObjectCommand({
      Bucket: S3_CONFIG.bucketName,
      Key: file.filename
    });

    await s3Client.send(deleteCommand);

    // Delete from database
    await prisma.file.delete({
      where: { id }
    });

    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete file' });
  }
});

// POST /api/files/upload-multiple - Upload multiple files
router.post('/upload-multiple', upload.array('files', 5), async (req: Request, res: Response) => {
  try {
    const files = req.files as any[];
    const userId = (req as any).user.id;

    if (!files || files.length === 0) {
      return res.status(400).json({ error: 'No files provided' });
    }

    const fileRecords = await Promise.all(
      files.map(async (file) => {
        return await prisma.file.create({
          data: {
            filename: file.key,
            originalName: file.originalname,
            mimeType: file.mimetype,
            size: file.size,
            url: file.location,
            userId
          }
        });
      })
    );

    res.status(201).json(fileRecords);
  } catch (error) {
    res.status(500).json({ error: 'Failed to upload files' });
  }
});

export default router;
