'use client';

import React, { useState, useEffect } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import {
  Section1,
  Section2,
  Section3,
  Section4,
  ISection2Child,
  ISection4Child,
} from '@preview-workspace/preview-lib';

interface EditDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any, file?: File) => void;
  item:
    | Section1
    | Section2
    | Section3
    | Section4
    | ISection2Child
    | ISection4Child
    | null;
  itemType:
    | 'section1'
    | 'section2'
    | 'section3'
    | 'section4'
    | 'section2-child'
    | 'section4-child'
    | null;
}

export default function EditDialog({
  isOpen,
  onClose,
  onSave,
  item,
  itemType,
}: EditDialogProps) {
  const [formData, setFormData] = useState<any>({});
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  useEffect(() => {
    if (item && 'image' in item) {
      setFormData({ ...item });
      setImagePreview(item.image || null);
      setSelectedFile(null);
    } else if (item) {
      setFormData({ ...item });
      setSelectedFile(null);
    }
  }, [item]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData, selectedFile || undefined);
    onClose();
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev: any) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const imageUrl = URL.createObjectURL(file);
      setImagePreview(imageUrl);
      handleInputChange('image', imageUrl);
    }
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    setImagePreview(url);
    setSelectedFile(null); // Clear file when URL is entered
    handleInputChange('image', url);
  };

  const renderSection1Fields = () => (
    <>
      <div>
        <label
          htmlFor="title"
          style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}
        >
          Title:
        </label>
        <input
          id="title"
          type="text"
          value={formData.title || ''}
          onChange={(e) => handleInputChange('title', e.target.value)}
          style={{
            width: '100%',
            padding: '8px',
            border: '1px solid #ccc',
            borderRadius: '4px',
            marginBottom: '12px',
          }}
        />
      </div>
      <div>
        <label
          htmlFor="image"
          style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}
        >
          Image:
        </label>
        <div style={{ marginBottom: '12px' }}>
          <input
            id="image-file"
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            style={{
              width: '100%',
              padding: '8px',
              border: '1px solid #ccc',
              borderRadius: '4px',
              marginBottom: '8px',
            }}
          />
          <input
            id="image-url"
            type="url"
            placeholder="Or enter image URL"
            value={formData.image || ''}
            onChange={handleUrlChange}
            style={{
              width: '100%',
              padding: '8px',
              border: '1px solid #ccc',
              borderRadius: '4px',
            }}
          />
        </div>
        {imagePreview && (
          <div style={{ marginBottom: '12px' }}>
            <img
              src={imagePreview}
              alt="Preview"
              style={{
                maxWidth: '100%',
                maxHeight: '200px',
                border: '1px solid #ccc',
                borderRadius: '4px',
              }}
            />
          </div>
        )}
      </div>
    </>
  );

  const renderSection2Fields = () => (
    <>
      <div>
        <label
          htmlFor="title"
          style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}
        >
          Title:
        </label>
        <input
          id="title"
          type="text"
          value={formData.title || ''}
          onChange={(e) => handleInputChange('title', e.target.value)}
          style={{
            width: '100%',
            padding: '8px',
            border: '1px solid #ccc',
            borderRadius: '4px',
            marginBottom: '12px',
          }}
        />
      </div>
    </>
  );

  const renderSection3Fields = () => (
    <>
      <div>
        <label
          htmlFor="title"
          style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}
        >
          Title:
        </label>
        <input
          id="title"
          type="text"
          value={formData.title || ''}
          onChange={(e) => handleInputChange('title', e.target.value)}
          style={{
            width: '100%',
            padding: '8px',
            border: '1px solid #ccc',
            borderRadius: '4px',
            marginBottom: '12px',
          }}
        />
      </div>
      <div>
        <label
          htmlFor="subtitle"
          style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}
        >
          Subtitle:
        </label>
        <textarea
          id="subtitle"
          value={formData.subtitle || ''}
          onChange={(e) => handleInputChange('subtitle', e.target.value)}
          rows={3}
          style={{
            width: '100%',
            padding: '8px',
            border: '1px solid #ccc',
            borderRadius: '4px',
            marginBottom: '12px',
            resize: 'vertical',
          }}
        />
      </div>
      <div>
        <label
          htmlFor="cta-title"
          style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}
        >
          CTA Title:
        </label>
        <input
          id="cta-title"
          type="text"
          value={formData.cta?.title || ''}
          onChange={(e) =>
            handleInputChange('cta', { ...formData.cta, title: e.target.value })
          }
          style={{
            width: '100%',
            padding: '8px',
            border: '1px solid #ccc',
            borderRadius: '4px',
            marginBottom: '12px',
          }}
        />
      </div>
      <div>
        <label
          htmlFor="cta-link"
          style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}
        >
          CTA Link:
        </label>
        <input
          id="cta-link"
          type="url"
          value={formData.cta?.link || ''}
          onChange={(e) =>
            handleInputChange('cta', { ...formData.cta, link: e.target.value })
          }
          placeholder="https://example.com"
          style={{
            width: '100%',
            padding: '8px',
            border: '1px solid #ccc',
            borderRadius: '4px',
            marginBottom: '12px',
          }}
        />
      </div>
    </>
  );

  const renderSection2ChildFields = () => (
    <>
      <div>
        <label
          htmlFor="name"
          style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}
        >
          Name:
        </label>
        <input
          id="name"
          type="text"
          value={formData.name || ''}
          onChange={(e) => handleInputChange('name', e.target.value)}
          style={{
            width: '100%',
            padding: '8px',
            border: '1px solid #ccc',
            borderRadius: '4px',
            marginBottom: '12px',
          }}
        />
      </div>
    </>
  );

  const renderSection4Fields = () => (
    <>
      <div>
        <label
          htmlFor="title"
          style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}
        >
          Title:
        </label>
        <input
          id="title"
          type="text"
          value={formData.title || ''}
          onChange={(e) => handleInputChange('title', e.target.value)}
          style={{
            width: '100%',
            padding: '8px',
            border: '1px solid #ccc',
            borderRadius: '4px',
            marginBottom: '12px',
          }}
        />
      </div>
    </>
  );

  const renderSection4ChildFields = () => (
    <>
      <div>
        <label
          htmlFor="title"
          style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}
        >
          Title:
        </label>
        <input
          id="title"
          type="text"
          value={formData.title || ''}
          onChange={(e) => handleInputChange('title', e.target.value)}
          style={{
            width: '100%',
            padding: '8px',
            border: '1px solid #ccc',
            borderRadius: '4px',
            marginBottom: '12px',
          }}
        />
      </div>
    </>
  );

  const renderFields = () => {
    switch (itemType) {
      case 'section1':
        return renderSection1Fields();
      case 'section2':
        return renderSection2Fields();
      case 'section3':
        return renderSection3Fields();
      case 'section4':
        return renderSection4Fields();
      case 'section2-child':
        return renderSection2ChildFields();
      case 'section4-child':
        return renderSection4ChildFields();
      default:
        return null;
    }
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay
          style={{
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            position: 'fixed',
            inset: 0,
            zIndex: 10001,
          }}
        />
        <Dialog.Content
          style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '90vw',
            maxWidth: '450px',
            maxHeight: '85vh',
            overflowY: 'auto',
            zIndex: 10002,
            padding: '20px',
          }}
        >
          <Dialog.Title
            style={{
              fontSize: '18px',
              fontWeight: 'bold',
              marginBottom: '16px',
            }}
          >
            Edit {itemType?.replace('-', ' ')}
          </Dialog.Title>

          <form onSubmit={handleSubmit}>
            {renderFields()}

            <div
              style={{
                display: 'flex',
                gap: '12px',
                justifyContent: 'flex-end',
                marginTop: '20px',
              }}
            >
              <button
                type="button"
                onClick={onClose}
                style={{
                  padding: '8px 16px',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                  background: 'white',
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                style={{
                  padding: '8px 16px',
                  border: 'none',
                  borderRadius: '4px',
                  background: '#3b82f6',
                  color: 'white',
                  cursor: 'pointer',
                }}
              >
                Save
              </button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
