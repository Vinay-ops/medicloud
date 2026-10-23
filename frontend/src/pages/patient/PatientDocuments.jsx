import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, FileText, Upload, Trash2, File, Image, AlertCircle, CheckCircle2, CloudUpload, FolderOpen } from 'lucide-react';
import { apiRequest } from '../../utils/api';
import { Button } from '../../components/common/Button';

const MAX_FILE_BYTES = 10 * 1024 * 1024;
const ALLOWED_TYPES = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];
const formatSize = (size) => {
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${Math.round(size / 1024)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
};
const formatUploadedAt = (timestamp) => {
  const d = new Date(timestamp);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const getFileIcon = (fileName) => {
  const ext = fileName?.split('.').pop()?.toLowerCase();
  if (['jpg', 'jpeg', 'png', 'webp'].includes(ext)) return Image;
  return FileText;
};

export const PatientDocuments = () => {
  const [documents, setDocuments] = useState([]);
  const [file, setFile] = useState(null);
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [deletingId, setDeletingId] = useState(null);
  const [dragOver, setDragOver] = useState(false);

  const refresh = async () => {
    const result = await apiRequest('/documents');
    setDocuments(result.documents || []);
  };

  useEffect(() => {
    let active = true;
    apiRequest('/documents')
      .then((result) => { if (active) setDocuments(result.documents || []); })
      .catch((failure) => { if (active) setError(failure.message); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const handleFileDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const dropped = e.dataTransfer?.files?.[0];
    if (dropped) setFile(dropped);
  };

  const upload = async (event) => {
    event.preventDefault();
    if (!file) return setError('Please choose a file to upload.');
    if (!ALLOWED_TYPES.includes(file.type)) return setError('Allowed types: PDF, JPEG, PNG, or WebP.');
    if (file.size > MAX_FILE_BYTES) return setError('File must be 10 MB or smaller.');
    setError('');
    setNotice('');
    setUploading(true);
    let uploadId = null;
    try {
      const request = await apiRequest('/documents/upload-url', {
        method: 'POST',
        body: { fileName: file.name, fileType: file.type, fileSizeBytes: file.size, description: description || undefined },
      });
      uploadId = request.uploadId;
      const url = new URL(request.uploadUrl);
      const isLocalMock = import.meta.env.VITE_APP_ENV !== 'production' && url.hostname === 'localhost' && url.port === '9090';
      if (isLocalMock) {
        setNotice('Local mock storage simulated this upload. No file was sent to AWS.');
      } else {
        const uploadResponse = await fetch(request.uploadUrl, {
          method: 'PUT',
          headers: { 'Content-Type': file.type, 'x-amz-server-side-encryption': 'AES256' },
          body: file,
        });
        if (!uploadResponse.ok) throw new Error('The secure file upload failed. Try again.');
      }
      await apiRequest('/documents/confirm-upload', { method: 'POST', body: { uploadId: request.uploadId } });
      await refresh();
      setFile(null);
      setDescription('');
      setNotice('Document uploaded successfully!');
    } catch (failure) {
      if (uploadId) await apiRequest(`/documents/upload-intent/${encodeURIComponent(uploadId)}`, { method: 'DELETE' }).catch(() => {});
      setError(failure.message || 'The document could not be uploaded.');
    } finally {
      setUploading(false);
    }
  };

  const download = async (documentId) => {
    try {
      const result = await apiRequest(`/documents/${encodeURIComponent(documentId)}/download-url`);
      window.location.assign(result.downloadUrl);
    } catch (failure) { setError(failure.message); }
  };

  const remove = async (documentId) => {
    setDeletingId(documentId);
    try {
      await apiRequest(`/documents/${encodeURIComponent(documentId)}`, { method: 'DELETE' });
      await refresh();
    } catch (failure) {
      setError(failure.message);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#0066FF] mb-1">
            <FileText className="w-4 h-4" />
            <span>Secure Health Vault</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1E293B] tracking-tight">
            Medical Documents
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Your files are encrypted and private — only accessible to your account.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            AES-256 Encrypted
          </span>
        </div>
      </motion.div>

      {/* Upload Card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-3xl border border-[#E2E8F0] shadow-sm overflow-hidden"
      >
        <div className="p-6 border-b border-slate-100">
          <h2 className="text-base font-bold text-[#1E293B] flex items-center gap-2">
            <CloudUpload className="w-5 h-5 text-[#0066FF]" />
            Upload New Document
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">PDF, JPEG, PNG, or WebP up to 10 MB</p>
        </div>

        <form onSubmit={upload} className="p-6 space-y-5">
          {/* Drag & Drop Zone */}
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleFileDrop}
            onClick={() => document.getElementById('file-input-medicloud').click()}
            className={`relative border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
              dragOver
                ? 'border-[#0066FF] bg-blue-50/50'
                : file
                ? 'border-emerald-400 bg-emerald-50/50'
                : 'border-slate-200 hover:border-[#0066FF]/50 hover:bg-slate-50'
            }`}
          >
            <input
              id="file-input-medicloud"
              type="file"
              accept="application/pdf,image/jpeg,image/png,image/webp"
              className="sr-only"
              onChange={(e) => { setFile(e.target.files?.[0] || null); setError(''); }}
            />
            {file ? (
              <div className="flex flex-col items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-bold text-[#1E293B] truncate max-w-xs mx-auto">{file.name}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{formatSize(file.size)} · Click to change file</p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#0066FF] flex items-center justify-center">
                  <Upload className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-700">
                    {dragOver ? 'Drop file here' : 'Drag & drop or click to browse'}
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">PDF, JPEG, PNG, WebP · Max 10 MB</p>
                </div>
              </div>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-600 block mb-1.5">
              Description <span className="font-normal text-slate-400">(optional)</span>
            </label>
            <input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={500}
              placeholder="e.g. Annual blood test results — January 2025"
              className="w-full bg-slate-50 text-slate-900 text-sm rounded-xl border border-slate-200 px-3.5 py-2.5 focus:bg-white focus:border-[#0066FF] focus:ring-2 focus:ring-[#0066FF]/15 outline-none transition-all placeholder:text-slate-400"
            />
          </div>

          {/* Feedback Messages */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                role="alert"
                className="flex items-center gap-3 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs"
              >
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </motion.div>
            )}
            {notice && !error && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                role="status"
                className="flex items-center gap-3 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs"
              >
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{notice}</span>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex items-center justify-end">
            <Button
              type="submit"
              variant="primary"
              isLoading={uploading}
              leftIcon={Upload}
              disabled={!file}
              className="bg-[#0066FF] hover:bg-[#0052CC] font-bold shadow-md rounded-xl px-6"
            >
              {uploading ? 'Uploading…' : 'Upload Document'}
            </Button>
          </div>
        </form>
      </motion.div>

      {/* Documents List */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-3xl border border-[#E2E8F0] shadow-sm overflow-hidden"
      >
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-[#1E293B] flex items-center gap-2">
              <FolderOpen className="w-5 h-5 text-[#0066FF]" />
              Your Documents
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {loading ? 'Loading…' : `${documents.length} file${documents.length !== 1 ? 's' : ''} stored`}
            </p>
          </div>
        </div>

        {loading ? (
          <div className="p-12 flex flex-col items-center gap-3">
            <div className="w-10 h-10 rounded-full border-4 border-[#0066FF]/20 border-t-[#0066FF] animate-spin" />
            <p className="text-sm text-slate-500">Loading your documents…</p>
          </div>
        ) : documents.length === 0 ? (
          <div className="p-12 flex flex-col items-center gap-4 text-center">
            <div className="w-16 h-16 rounded-3xl bg-slate-100 text-slate-400 flex items-center justify-center">
              <FileText className="w-8 h-8" />
            </div>
            <div>
              <h4 className="text-base font-bold text-[#1E293B]">No documents uploaded yet</h4>
              <p className="text-sm text-slate-500 mt-1 max-w-sm mx-auto">
                Securely upload your medical reports, lab results, prescriptions, and imaging files.
              </p>
            </div>
          </div>
        ) : (
          <ul className="divide-y divide-slate-100">
            <AnimatePresence>
              {documents.map((doc) => {
                const FileIcon = getFileIcon(doc.fileName);
                return (
                  <motion.li
                    key={doc.documentId}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="p-4 sm:p-5 flex items-center gap-4 hover:bg-slate-50/70 transition-colors"
                  >
                    {/* Icon */}
                    <div className="w-11 h-11 rounded-2xl bg-blue-50 text-[#0066FF] flex items-center justify-center shrink-0">
                      <FileIcon className="w-5 h-5" />
                    </div>

                    {/* Info */}
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-bold text-[#1E293B] truncate">{doc.fileName}</p>
                      <div className="flex items-center flex-wrap gap-x-3 gap-y-0.5 mt-0.5">
                        {doc.description && (
                          <p className="text-xs text-slate-500 truncate max-w-xs">{doc.description}</p>
                        )}
                        <p className="text-xs text-slate-400">
                          {formatSize(doc.fileSizeBytes || 0)} · {formatUploadedAt(doc.uploadedAt)}
                        </p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => download(doc.documentId)}
                        aria-label={`Download ${doc.fileName}`}
                        className="p-2 text-[#0066FF] hover:bg-blue-50 rounded-xl transition-colors"
                        title="Download"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => remove(doc.documentId)}
                        disabled={deletingId === doc.documentId}
                        aria-label={`Delete ${doc.fileName}`}
                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors disabled:opacity-50"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </motion.li>
                );
              })}
            </AnimatePresence>
          </ul>
        )}
      </motion.div>
    </div>
  );
};
