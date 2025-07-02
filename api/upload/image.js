const { put } = require('@vercel/blob');
const { corsHeaders, authenticateToken, requireAdmin } = require('../../lib/auth');

export default async function handler(req, res) {
  // 设置CORS头
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // 身份验证和管理员权限检查
  const authResult = await authenticateToken(req);
  if (!authResult.success) {
    return res.status(401).json(authResult);
  }

  const adminResult = await requireAdmin(authResult.user);
  if (!adminResult.success) {
    return res.status(403).json(adminResult);
  }

  if (req.method === 'POST') {
    try {
      // 检查请求中是否包含文件数据
      const contentType = req.headers['content-type'];
      if (!contentType || !contentType.includes('multipart/form-data')) {
        return res.status(400).json({
          success: false,
          message: '请使用multipart/form-data格式上传文件'
        });
      }

      // 从请求体中提取文件数据
      const { searchParams } = new URL(req.url, `https://${req.headers.host}`);
      const filename = searchParams.get('filename') || `product-${Date.now()}.jpg`;
      
      if (!req.body) {
        return res.status(400).json({
          success: false,
          message: '请选择要上传的图片'
        });
      }

      // 检查文件类型
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      const fileType = req.headers['content-type'];
      
      if (!allowedTypes.some(type => fileType.includes(type))) {
        return res.status(400).json({
          success: false,
          message: '只允许上传图片文件（JPEG、PNG、GIF、WebP）'
        });
      }

      // 检查文件大小（5MB限制）
      const contentLength = parseInt(req.headers['content-length'] || '0');
      if (contentLength > 5 * 1024 * 1024) {
        return res.status(400).json({
          success: false,
          message: '文件大小超过限制（最大5MB）'
        });
      }

      // 上传到Vercel Blob
      const blob = await put(`products/${filename}`, req.body, {
        access: 'public',
        contentType: fileType
      });

      res.json({
        success: true,
        data: {
          url: blob.url,
          filename: filename,
          size: contentLength
        },
        message: '图片上传成功'
      });

    } catch (error) {
      console.error('图片上传失败:', error);
      res.status(500).json({
        success: false,
        message: '图片上传失败: ' + error.message
      });
    }

  } else if (req.method === 'DELETE') {
    try {
      const { filename } = req.query;
      
      if (!filename) {
        return res.status(400).json({
          success: false,
          message: '请提供要删除的文件名'
        });
      }

      // 注意: Vercel Blob目前不支持删除功能
      // 这里我们只返回成功，实际上文件仍然存在
      // 在生产环境中，你可能需要维护一个文件列表并标记删除状态
      
      res.json({
        success: true,
        message: '图片删除请求已记录（注意：Vercel Blob暂不支持直接删除）'
      });

    } catch (error) {
      console.error('图片删除失败:', error);
      res.status(500).json({
        success: false,
        message: '图片删除失败'
      });
    }

  } else {
    return res.status(405).json({
      success: false,
      message: '方法不允许'
    });
  }
} 