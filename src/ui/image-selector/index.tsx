'use client';

import { getImageApiPath } from '@/utils/path';
import { UploadIcon } from '@radix-ui/react-icons';
import { Box, Button, VisuallyHidden } from '@radix-ui/themes';
import { useTranslations } from 'next-intl';
import { useRef, useState } from 'react';

interface Props {
  size?: 'small' | 'medium';
  name: string;
  onSelect: (file: File) => Promise<string>;
  defaultValue?: string;
}

export default function ImageSelector({ size = 'medium', name, onSelect, defaultValue }: Props) {
  const [isUploading, setIsUploading] = useState(false);
  const [imagePath, setImagePath] = useState<string | null>(defaultValue ?? null);
  const t = useTranslations('ImageSelector');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setIsUploading(true);
      const imageFilename = await onSelect(file);
      setImagePath(getImageApiPath(imageFilename));
      setIsUploading(false);
    }
  };

  const sizeStyle = {
    small: { width: '32px', height: '32px' },
    medium: { width: '300px', height: '125px' }
  };

  return (
    <>
      {imagePath && (
        <img src={imagePath} alt="Selected" style={{ maxWidth: sizeStyle[size].width }} />
      )}
      {!imagePath && (
        <Box
          style={{
            border: '2px dashed',
            borderColor: 'var(--gray-a7)',
            width: sizeStyle[size].width,
            height: sizeStyle[size].height
          }}
        ></Box>
      )}
      <input type="hidden" name={name} value={imagePath ?? ''} />
      <Box>
        <Button disabled={isUploading} type="button" onClick={() => fileInputRef.current?.click()}>
          <UploadIcon />
          {t('selectImage')}
        </Button>
      </Box>
      <VisuallyHidden>
        <input type="file" accept="image/*" ref={fileInputRef} onChange={handleFileChange} />
      </VisuallyHidden>
    </>
  );
}
